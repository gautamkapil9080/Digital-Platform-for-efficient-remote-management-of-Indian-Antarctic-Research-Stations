import { Routes, Route } from 'react-router-dom';

import BaseLayout from './components/common/BaseLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Infrastructure from './pages/Infrastructure';
import Energy from './pages/Energy';
import Logistics from './pages/Logistics';
import Environment from './pages/Environment';
import Alerts from './pages/Alerts';
import StationView from './pages/StationView';

export default function App() {
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
        element={<Login />}
      />


      {/* =====================================================
          AUTHENTICATED DASHBOARD
      ===================================================== */}

      <Route
        path="/dashboard"
        element={
          <BaseLayout>
            <Dashboard />
          </BaseLayout>
        }
      />


      {/* =====================================================
          APPLICATION MODULES
      ===================================================== */}

      <Route
        path="/infrastructure"
        element={
          <BaseLayout>
            <Infrastructure />
          </BaseLayout>
        }
      />


      <Route
        path="/energy"
        element={
          <BaseLayout>
            <Energy />
          </BaseLayout>
        }
      />


      <Route
        path="/logistics"
        element={
          <BaseLayout>
            <Logistics />
          </BaseLayout>
        }
      />


      <Route
        path="/environment"
        element={
          <BaseLayout>
            <Environment />
          </BaseLayout>
        }
      />


      <Route
        path="/alerts"
        element={
          <BaseLayout>
            <Alerts />
          </BaseLayout>
        }
      />


      <Route
        path="/view"
        element={
          <BaseLayout>
            <StationView />
          </BaseLayout>
        }
      />

    </Routes>
  );
}