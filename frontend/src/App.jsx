import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Infrastructure from './pages/Infrastructure';
import Energy from './pages/Energy';
import Logistics from './pages/Logistics';
import Environment from './pages/Environment';
import Alerts from './pages/Alerts';
import StationView from './pages/StationView';

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <Protected>
            <div className="app-shell">
              <Navbar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/infrastructure" element={<Infrastructure />} />
                  <Route path="/energy" element={<Energy />} />
                  <Route path="/logistics" element={<Logistics />} />
                  <Route path="/environment" element={<Environment />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/view" element={<StationView />} />
                </Routes>
              </main>
            </div>
          </Protected>
        }
      />
    </Routes>
  );
}
