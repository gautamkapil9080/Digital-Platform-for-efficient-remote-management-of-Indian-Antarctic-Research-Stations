import axios from 'axios';

// Vite replaces VITE_* values at build time. Keep the Render backend as a
// production fallback so a missing Static Site environment variable does not
// silently send API requests back to the frontend host.
const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD
    ? 'https://digital-platform-for-efficient-remote.onrender.com/api'
    : '/api');

const client = axios.create({
  // VITE_API_URL should include the /api suffix.
  baseURL: API_BASE_URL,
  timeout: 10000
});

// attach the stored login token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// if the token is rejected or expired, force a re-login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('token');

      // Only redirect if an authenticated session actually exists
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// triggers a browser download for a CSV/PDF export endpoint
export async function downloadExport(module, stationId, format) {
  const res = await client.get(`/export/${module}/${stationId}`, {
    params: { format },
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  const ext = format === 'pdf' ? 'pdf' : 'csv';
  link.setAttribute('download', `${module}-report.${ext}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default client;