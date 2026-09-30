import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import BaseLayout from './components/common/BaseLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Infrastructure from './pages/Infrastructure';
import Energy from './pages/Energy';
import Logistics from './pages/Logistics';
import Environment from './pages/Environment';
import Alerts from './pages/Alerts';
import StationView from './pages/StationView';

function ProtectedLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <BaseLayout>{children}</BaseLayout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>

      {/* =====================================================
          PUBLIC MAIN LANDING PAGE
      ===================================================== */}

      <Route
        path="/"
        element={<BaseLayout />}
      />


      {/* =====================================================
          LOGIN
      ===================================================== */}

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />


      {/* =====================================================
          AUTHENTICATED DASHBOARD
      ===================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />


      {/* =====================================================
          APPLICATION MODULES
      ===================================================== */}

      <Route
        path="/infrastructure"
        element={
          <ProtectedLayout>
            <Infrastructure />
          </ProtectedLayout>
        }
      />


      <Route
        path="/energy"
        element={
          <ProtectedLayout>
            <Energy />
          </ProtectedLayout>
        }
      />


      <Route
        path="/logistics"
        element={
          <ProtectedLayout>
            <Logistics />
          </ProtectedLayout>
        }
      />


      <Route
        path="/environment"
        element={
          <ProtectedLayout>
            <Environment />
          </ProtectedLayout>
        }
      />


      <Route
        path="/alerts"
        element={
          <ProtectedLayout>
            <Alerts />
          </ProtectedLayout>
        }
      />


      <Route
        path="/view"
        element={
          <ProtectedLayout>
            <StationView />
          </ProtectedLayout>
        }
      />

    </Routes>
  );
}
