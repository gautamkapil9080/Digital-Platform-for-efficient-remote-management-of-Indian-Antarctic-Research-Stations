import { useEffect, useState } from 'react';
import { useStations } from '../context/StationContext';
import client, { downloadExport } from '../api/client';
import socket from '../api/socket';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';

export default function Energy() {
  const { selectedStationId } = useStations();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!selectedStationId) return;
    let cancelled = false;
    client.get(`/energy/station/${selectedStationId}?limit=60`).then((res) => {
      if (!cancelled) setHistory(res.data);
    });
    return () => { cancelled = true; };
  }, [selectedStationId]);

  useEffect(() => {
    function onEnergy(log) {
      if (log.station !== selectedStationId) return;
      setHistory((prev) => [...prev.slice(-59), log]);
    }
    socket.on('energy:new', onEnergy);
    return () => socket.off('energy:new', onEnergy);
  }, [selectedStationId]);

  const latest = history[history.length - 1];
  const totalGeneration = latest ? (latest.solarOutputKw + latest.windOutputKw + latest.dieselOutputKw) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Energy management</h1>
          <p className="page-sub">Solar, wind and diesel generation against consumption &amp; battery reserve</p>
        </div>
        <div className="export-buttons">
          <button className="btn-small" onClick={() => downloadExport('energy', selectedStationId, 'csv')}>Export CSV</button>
          <button className="btn-small" onClick={() => downloadExport('energy', selectedStationId, 'pdf')}>Export PDF</button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total generation" value={totalGeneration.toFixed(1)} unit="kW" tone="accent" />
        <StatCard label="Consumption" value={latest ? latest.consumptionKw.toFixed(1) : '--'} unit="kW" tone="neutral" />
        <StatCard label="Battery reserve" value={latest ? latest.batteryPercent.toFixed(0) : '--'} unit="%" tone={latest && latest.batteryPercent < 30 ? 'critical' : 'accent'} />
        <StatCard label="Net balance" value={latest ? (totalGeneration - latest.consumptionKw).toFixed(1) : '--'} unit="kW" tone={latest && totalGeneration - latest.consumptionKw < 0 ? 'warning' : 'neutral'} />
      </div>

      <div className="panel-grid">
        <ChartCard
          title="Generation mix"
          data={history}
          yUnit="kW"
          series={[
            { dataKey: 'solarOutputKw', name: 'Solar', color: '#E8B04B' },
            { dataKey: 'windOutputKw', name: 'Wind', color: '#5EC9C0' },
            { dataKey: 'dieselOutputKw', name: 'Diesel', color: '#9B8CF2' }
          ]}
        />
        <ChartCard
          title="Consumption vs. generation"
          data={history}
          yUnit="kW"
          series={[{ dataKey: 'consumptionKw', name: 'Consumption', color: '#E5484D' }]}
        />
        <ChartCard
          title="Battery reserve trend"
          data={history}
          yUnit="%"
          series={[{ dataKey: 'batteryPercent', name: 'Battery %', color: '#E8B04B' }]}
        />
      </div>
    </div>
  );
}
