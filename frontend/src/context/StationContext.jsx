import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';
import socket, { joinStationRoom } from '../api/socket';
import { useAuth } from './AuthContext';

const StationContext = createContext(null);

export function StationProvider({ children }) {
  const { user } = useAuth();
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(
    localStorage.getItem('selectedStationId') || null
  );
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const res = await client.get('/stations');
    setStations(res.data);
    setLoading(false);
    const hasSelectedStation = res.data.some((summary) => summary.station._id === selectedStationId);
    if (res.data.length && !hasSelectedStation) {
      const first = res.data[0].station._id;
      setSelectedStationId(first);
      localStorage.setItem('selectedStationId', first);
    } else if (!res.data.length) {
      setSelectedStationId(null);
      localStorage.removeItem('selectedStationId');
    }
  }

  useEffect(() => {
    // Station data is protected by the API. Avoid requesting it on the login
    // screen, where the resulting 401 would otherwise force a page reload.
    if (!user) {
      setStations([]);
      setLoading(false);
      return;
    }
    refresh();
    // the summary (open-alert counts etc.) still refreshes on a slow poll;
    // the detailed charts/tables get pushed live via socket events instead.
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // rejoin the right station "room" whenever the selection changes, and on
  // (re)connect - so a dropped connection doesn't silently stop live updates
  useEffect(() => {
    if (!selectedStationId) return;
    joinStationRoom(selectedStationId);
    socket.on('connect', () => joinStationRoom(selectedStationId));
    return () => socket.off('connect');
  }, [selectedStationId]);

  // any live event that affects the summary triggers an immediate refresh
  // instead of waiting for the next poll
  useEffect(() => {
    const handler = () => refresh();
    socket.on('alert:new', handler);
    socket.on('infrastructure:update', handler);
    socket.on('logistics:update', handler);
    return () => {
      socket.off('alert:new', handler);
      socket.off('infrastructure:update', handler);
      socket.off('logistics:update', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectStation(id) {
    setSelectedStationId(id);
    localStorage.setItem('selectedStationId', id);
  }

  const selectedSummary = stations.find((s) => s.station._id === selectedStationId) || null;

  return (
    <StationContext.Provider value={{ stations, selectedStationId, selectStation, selectedSummary, loading, refresh }}>
      {children}
    </StationContext.Provider>
  );
}

export function useStations() {
  return useContext(StationContext);
}
