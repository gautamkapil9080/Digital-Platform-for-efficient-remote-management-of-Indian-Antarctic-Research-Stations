import { useEffect, useState } from 'react';
import { useStations } from '../context/StationContext';
import client, { downloadExport } from '../api/client';
import socket from '../api/socket';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';

export default function Environment() {
  const { selectedStationId } = useStations();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!selectedStationId) return;
    let cancelled = false;
    client.get(`/environment/station/${selectedStationId}?limit=60`).then((res) => {
      if (!cancelled) setHistory(res.data);
    });
    return () => { cancelled = true; };
  }, [selectedStationId]);

  useEffect(() => {
    function onEnv(reading) {
      if (reading.station !== selectedStationId) return;
      setHistory((prev) => [...prev.slice(-59), reading]);
    }
    socket.on('environment:new', onEnv);
    return () => socket.off('environment:new', onEnv);
  }, [selectedStationId]);

  const latest = history[history.length - 1];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Environmental monitoring</h1>
          <p className="page-sub">Temperature, wind, humidity, ice thickness and visibility</p>
        </div>
        <div className="export-buttons">
          <button className="btn-small" onClick={() => downloadExport('environment', selectedStationId, 'csv')}>Export CSV</button>
          <button className="btn-small" onClick={() => downloadExport('environment', selectedStationId, 'pdf')}>Export PDF</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Temperature" value={latest ? latest.tempC.toFixed(1) : '--'} unit="&deg;C" tone="ice" />
        <StatCard label="Wind speed" value={latest ? latest.windSpeedKmh.toFixed(0) : '--'} unit="km/h" tone={latest && latest.windSpeedKmh > 70 ? 'critical' : 'ice'} />
        <StatCard label="Humidity" value={latest ? latest.humidityPercent.toFixed(0) : '--'} unit="%" tone="neutral" />
        <StatCard label="Ice thickness" value={latest ? latest.iceThicknessCm.toFixed(0) : '--'} unit="cm" tone="neutral" />
        <StatCard label="Visibility" value={latest ? latest.visibilityKm.toFixed(1) : '--'} unit="km" tone={latest && latest.visibilityKm < 1 ? 'critical' : 'neutral'} />
      </div>

      <div className="panel-grid">
        <ChartCard
          title="Temperature & wind speed"
          data={history}
          series={[
            { dataKey: 'tempC', name: 'Temp (\u00b0C)', color: '#5EC9C0' },
            { dataKey: 'windSpeedKmh', name: 'Wind (km/h)', color: '#E5484D' }
          ]}
        />
        <ChartCard
          title="Humidity & visibility"
          data={history}
          series={[
            { dataKey: 'humidityPercent', name: 'Humidity %', color: '#9B8CF2' },
            { dataKey: 'visibilityKm', name: 'Visibility (km)', color: '#E8B04B' }
          ]}
        />
        <ChartCard
          title="Ice thickness"
          data={history}
          yUnit="cm"
          series={[{ dataKey: 'iceThicknessCm', name: 'Ice thickness', color: '#5EC9C0' }]}
        />
      </div>
    </div>
  );
}
