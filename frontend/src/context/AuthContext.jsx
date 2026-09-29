import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';
import socket from '../api/socket';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    // Bad browser storage must not prevent the app from rendering.
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  // Live station telemetry uses the same JWT as the protected HTTP API.
  useEffect(() => {
    if (user) socket.connect();
    else socket.disconnect();
  }, [user]);

  async function login(username, password) {
    const res = await client.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  async function register(name, username, password) {
    const res = await client.post('/auth/register', { name, username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  const isOperator = user?.role === 'operator';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isOperator }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
