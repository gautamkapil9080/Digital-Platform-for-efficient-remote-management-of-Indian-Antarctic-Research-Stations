import { useEffect, useState } from 'react';
import { useStations } from '../context/StationContext';
import client from '../api/client';
import socket from '../api/socket';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const { selectedSummary, selectedStationId } = useStations();
  const [energyHistory, setEnergyHistory] = useState([]);
  const [envHistory, setEnvHistory] = useState([]);

  // initial load whenever the selected station changes
  useEffect(() => {
    if (!selectedStationId) return;
    let cancelled = false;
    async function load() {
      const [energyRes, envRes] = await Promise.all([
        client.get(`/energy/station/${selectedStationId}?limit=30`),
        client.get(`/environment/station/${selectedStationId}?limit=30`)
      ]);
      if (!cancelled) {
        setEnergyHistory(energyRes.data);
        setEnvHistory(envRes.data);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedStationId]);

  // live updates pushed by the simulator - no more polling
  useEffect(() => {
    function onEnergy(log) {
      if (log.station !== selectedStationId) return;
      setEnergyHistory((prev) => [...prev.slice(-29), log]);
    }
    function onEnv(reading) {
      if (reading.station !== selectedStationId) return;
      setEnvHistory((prev) => [...prev.slice(-29), reading]);
    }
    socket.on('energy:new', onEnergy);
    socket.on('environment:new', onEnv);
    return () => {
      socket.off('energy:new', onEnergy);
      socket.off('environment:new', onEnv);
    };
  }, [selectedStationId]);

  if (!selectedSummary) return <div className="page-loading">Loading station telemetry...</div>;

  const { station, latestEnergy, latestEnv, openAlerts, criticalInfra, lowStock } = selectedSummary;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{station.name} Station</h1>
          <p className="page-sub">{station.location?.description} &middot; established {station.established}</p>
        </div>
        <StatusBadge status={station.overallStatus} />
      </div>

      <div className="stat-grid">
        <StatCard
          label="Battery reserve"
          value={latestEnergy ? latestEnergy.batteryPercent.toFixed(0) : '--'}
          unit="%"
          tone={latestEnergy && latestEnergy.batteryPercent < 30 ? 'critical' : 'accent'}
        />
        <StatCard
          label="Outside temperature"
          value={latestEnv ? latestEnv.tempC.toFixed(1) : '--'}
          unit="&deg;C"
          tone="ice"
        />
        <StatCard
          label="Wind speed"
          value={latestEnv ? latestEnv.windSpeedKmh.toFixed(0) : '--'}
          unit="km/h"
          tone={latestEnv && latestEnv.windSpeedKmh > 70 ? 'critical' : 'ice'}
        />
        <StatCard label="Open alerts" value={openAlerts} tone={openAlerts > 0 ? 'warning' : 'neutral'} />
        <StatCard label="Critical infrastructure units" value={criticalInfra} tone={criticalInfra > 0 ? 'critical' : 'neutral'} />
        <StatCard label="Low-stock items" value={lowStock} tone={lowStock > 0 ? 'warning' : 'neutral'} />
      </div>

      <div className="panel-grid">
        <ChartCard
          title="Power generation vs. consumption"
          data={energyHistory}
          yUnit="kW"
          series={[
            { dataKey: 'solarOutputKw', name: 'Solar', color: '#E8B04B' },
            { dataKey: 'windOutputKw', name: 'Wind', color: '#5EC9C0' },
            { dataKey: 'dieselOutputKw', name: 'Diesel', color: '#9B8CF2' },
            { dataKey: 'consumptionKw', name: 'Consumption', color: '#E5484D' }
          ]}
        />
        <ChartCard
          title="Battery reserve"
          data={energyHistory}
          yUnit="%"
          series={[{ dataKey: 'batteryPercent', name: 'Battery', color: '#E8B04B' }]}
        />
        <ChartCard
          title="Ambient temperature & wind"
          data={envHistory}
          series={[
            { dataKey: 'tempC', name: 'Temp (\u00b0C)', color: '#5EC9C0' },
            { dataKey: 'windSpeedKmh', name: 'Wind (km/h)', color: '#E5484D' }
          ]}
        />
      </div>
    </div>
  );
}
