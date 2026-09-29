import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
