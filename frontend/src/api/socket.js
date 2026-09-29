import { io } from 'socket.io-client';

// Vite replaces VITE_SOCKET_URL at build time. Keep the backend origin as the
// production fallback; connecting to window.location.origin would connect to
// the Render Static Site, which does not host Socket.IO.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || (import.meta.env.PROD
    ? 'https://digital-platform-for-efficient-remote.onrender.com'
    : 'http://localhost:5001');

const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (callback) => callback({ token: localStorage.getItem('token') })
});

export function joinStationRoom(stationId) {
  if (stationId) socket.emit('join-station', stationId);
}

export default socket;
