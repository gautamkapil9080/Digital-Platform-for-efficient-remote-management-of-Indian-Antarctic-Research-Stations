import { io } from 'socket.io-client';

// one shared socket connection for the whole app - vite's dev proxy only
// covers /api, so in dev we connect straight to the backend origin.
const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5001' : window.location.origin;

const socket = io(SOCKET_URL, { autoConnect: true });

export function joinStationRoom(stationId) {
  if (stationId) socket.emit('join-station', stationId);
}

export default socket;
