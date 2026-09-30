import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { useStations } from '../context/StationContext';
import client from '../api/client';
import socket from '../api/socket';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { selectedSummary, selectedStationId, loading, error, refresh } = useStations();
  const [energyHistory, setEnergyHistory] = useState([]);
  const [envHistory, setEnvHistory] = useState([]);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    if (!selectedStationId) return undefined;
    let cancelled = false;

    async function loadHistory() {
      try {
        const [energyRes, envRes] = await Promise.all([
          client.get(`/energy/station/${selectedStationId}?limit=30`),
          client.get(`/environment/station/${selectedStationId}?limit=30`)
        ]);
        if (!cancelled) {
          setEnergyHistory(energyRes.data);
          setEnvHistory(envRes.data);
          setHistoryError('');
        }
      } catch {
        if (!cancelled) setHistoryError('Historical charts are temporarily unavailable.');
      }
    }

    loadHistory();
    return () => { cancelled = true; };
  }, [selectedStationId]);

  useEffect(() => {
    function onEnergy(log) {
      if (log.station !== selectedStationId) return;
      setEnergyHistory((previous) => [...previous.slice(-29), log]);
    }
    function onEnvironment(reading) {
      if (reading.station !== selectedStationId) return;
      setEnvHistory((previous) => [...previous.slice(-29), reading]);
    }

    socket.on('energy:new', onEnergy);
    socket.on('environment:new', onEnvironment);
    return () => {
      socket.off('energy:new', onEnergy);
      socket.off('environment:new', onEnvironment);
    };
  }, [selectedStationId]);

  if (!selectedSummary) {
    if (loading) return <div className="page-loading">Loading station telemetry...</div>;
    return (
      <div className="page">
        <div className="panel">
          <h2>Station data unavailable</h2>
          <p>{error || 'No stations were returned by the backend.'}</p>
          <button className="btn-primary" type="button" onClick={refresh}>Retry</button>
        </div>
      </div>
    );
  }

  const { station, latestEnergy, latestEnv, openAlerts, criticalInfra, lowStock } = selectedSummary;

  return (
    <div className="dashboard-home">
      <section className="digital-twin-section">
        <div className="spline-container">
          <Spline scene="https://prod.spline.design/a7pxykqwfmeBIE3M/scene.splinecode" />
        </div>
        <div className="hero-overlay">
          <div className="hero-badge"><span className="live-dot" /> LIVE DIGITAL TWIN</div>
          <h1>Antarctic<br /><span>Station Intelligence</span></h1>
          <p>Explore the Antarctic station through an interactive digital twin with environmental and operational intelligence.</p>
          <div className="hero-buttons">
            <Link to="/view" className="hero-button primary">View Station Details <span>→</span></Link>
            <Link to="/environment" className="hero-button secondary">View Environment Data <span>→</span></Link>
          </div>
        </div>
      </section>

      <section className="dashboard-content">
        <div className="section-heading">
          <div>
            <span className="section-tag">LIVE STATION TELEMETRY</span>
            <h2>{station.name} Station</h2>
            <p className="page-sub">{station.location?.description} · established {station.established}</p>
          </div>
          <StatusBadge status={station.overallStatus} />
        </div>

        <div className="stat-grid">
          <StatCard label="Battery reserve" value={latestEnergy ? latestEnergy.batteryPercent.toFixed(0) : '--'} unit="%" tone={latestEnergy && latestEnergy.batteryPercent < 30 ? 'critical' : 'accent'} />
          <StatCard label="Outside temperature" value={latestEnv ? latestEnv.tempC.toFixed(1) : '--'} unit="°C" tone="ice" />
          <StatCard label="Wind speed" value={latestEnv ? latestEnv.windSpeedKmh.toFixed(0) : '--'} unit="km/h" tone={latestEnv && latestEnv.windSpeedKmh > 70 ? 'critical' : 'ice'} />
          <StatCard label="Open alerts" value={openAlerts} tone={openAlerts > 0 ? 'warning' : 'neutral'} />
          <StatCard label="Critical infrastructure units" value={criticalInfra} tone={criticalInfra > 0 ? 'critical' : 'neutral'} />
          <StatCard label="Low-stock items" value={lowStock} tone={lowStock > 0 ? 'warning' : 'neutral'} />
        </div>

        {historyError && <p className="field-error" role="status">{historyError}</p>}
        <div className="panel-grid">
          <ChartCard title="Power generation vs. consumption" data={energyHistory} yUnit="kW" series={[
            { dataKey: 'solarOutputKw', name: 'Solar', color: '#E8B04B' },
            { dataKey: 'windOutputKw', name: 'Wind', color: '#5EC9C0' },
            { dataKey: 'dieselOutputKw', name: 'Diesel', color: '#9B8CF2' },
            { dataKey: 'consumptionKw', name: 'Consumption', color: '#E5484D' }
          ]} />
          <ChartCard title="Battery reserve" data={energyHistory} yUnit="%" series={[
            { dataKey: 'batteryPercent', name: 'Battery', color: '#E8B04B' }
          ]} />
          <ChartCard title="Ambient temperature & wind" data={envHistory} series={[
            { dataKey: 'tempC', name: 'Temp (°C)', color: '#5EC9C0' },
            { dataKey: 'windSpeedKmh', name: 'Wind (km/h)', color: '#E5484D' }
          ]} />
        </div>
      </section>

      <section className="dashboard-content">
        <div className="section-heading">
          <div><span className="section-tag">STATION INTELLIGENCE</span><h2>Monitoring Modules</h2></div>
          <span className="live-indicator">● LIVE DATA</span>
        </div>
        <div className="dashboard-module-grid">
          <Link to="/view" className="dashboard-module-card"><div className="module-card-content"><span className="module-card-label">DIGITAL TWIN</span><strong>Station Overview</strong><p>Explore the digital representation of the Antarctic research station and its components.</p></div><span className="module-card-action">View Station Details →</span></Link>
          <Link to="/environment" className="dashboard-module-card"><div className="module-card-content"><span className="module-card-label">ENVIRONMENT</span><strong>Environmental Monitoring</strong><p>Monitor temperature, wind speed, humidity, ice thickness and visibility.</p></div><span className="module-card-action">View Environment Details →</span></Link>
          <Link to="/energy" className="dashboard-module-card"><div className="module-card-content"><span className="module-card-label">ENERGY</span><strong>Energy Management</strong><p>Monitor solar, wind and diesel generation, consumption and battery reserve.</p></div><span className="module-card-action">View Energy Details →</span></Link>
          <Link to="/infrastructure" className="dashboard-module-card"><div className="module-card-content"><span className="module-card-label">INFRASTRUCTURE</span><strong>Infrastructure Monitoring</strong><p>Inspect station facilities, structural health, equipment status and inspections.</p></div><span className="module-card-action">View Infrastructure Details →</span></Link>
          <Link to="/logistics" className="dashboard-module-card"><div className="module-card-content"><span className="module-card-label">LOGISTICS</span><strong>Supply Management</strong><p>Track food, fuel, medical supplies and critical station inventory.</p></div><span className="module-card-action">View Logistics Details →</span></Link>
          <Link to="/alerts" className="dashboard-module-card"><div className="module-card-content"><span className="module-card-label">ALERT CENTRE</span><strong>Station Alerts</strong><p>Review active warnings, operational events and critical station notifications.</p></div><span className="module-card-action">View Active Alerts →</span></Link>
        </div>
      </section>
    </div>
  );
}
