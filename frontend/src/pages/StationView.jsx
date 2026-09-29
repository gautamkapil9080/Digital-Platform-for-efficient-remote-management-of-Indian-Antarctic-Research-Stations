import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStations } from '../context/StationContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import socket from '../api/socket';
import StationModel from '../components/StationModel';

const PARTS = [
  { id: 'living', label: 'Living quarters', kind: 'building', point: [362, 315], bharatiPoint: [366, 338], infra: 'Living Quarters', module: 'Infrastructure' },
  { id: 'lab', label: 'Research lab', kind: 'building lab', point: [526, 286], bharatiPoint: [518, 310], infra: 'Laboratory', module: 'Infrastructure' },
  { id: 'power', label: 'Power house', kind: 'building power', point: [718, 319], bharatiPoint: [680, 342], infra: 'Power House', module: 'Energy' },
  { id: 'medical', label: 'Medical bay', kind: 'building small', point: [480, 356], bharatiPoint: [455, 367], infra: 'Medical Bay', module: 'Infrastructure' },
  { id: 'storage', label: 'Supply storage', kind: 'building storage', point: [620, 354], bharatiPoint: [590, 368], infra: 'Storage', module: 'Infrastructure' },
  { id: 'comms', label: 'Communications', kind: 'dish', point: [850, 258], bharatiPoint: [824, 281], infra: 'Communication', module: 'Infrastructure' },
  { id: 'solar', label: 'Solar array', kind: 'solar-array', point: [205, 307], bharatiPoint: [232, 357], module: 'Energy' },
  { id: 'wind', label: 'Wind turbine', kind: 'wind-turbine', point: [116, 191], bharatiPoint: [118, 195], module: 'Environment' }
];

function stationParts(code) {
  return PARTS;
}

function fmt(value, digits = 1) {
  if (value === null || value === undefined || value === '') return '--';
  return Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : '--';
}

export default function StationView() {
  const { stations, selectedStationId, selectStation } = useStations();
  const { isOperator } = useAuth();
  const [energy, setEnergy] = useState(null);
  const [environment, setEnvironment] = useState(null);
  const [units, setUnits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activePart, setActivePart] = useState(PARTS[0]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  const selected = stations.find((summary) => summary.station._id === selectedStationId);
  const station = selected?.station;
  const parts = useMemo(() => stationParts(station?.code), [station?.code]);

  const load = useCallback(async () => {
    if (!selectedStationId) return;
    try {
      const [energyRes, envRes, infraRes, alertsRes] = await Promise.all([
        client.get(`/energy/station/${selectedStationId}?limit=1`),
        client.get(`/environment/station/${selectedStationId}?limit=1`),
        client.get(`/infrastructure/station/${selectedStationId}`),
        client.get('/alerts', { params: { station: selectedStationId, resolved: 'false' } })
      ]);
      setEnergy(energyRes.data.at(-1) || null);
      setEnvironment(envRes.data.at(-1) || null);
      setUnits(infraRes.data);
      setAlerts(alertsRes.data.slice(0, 5));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load station telemetry. Check the backend connection.');
    }
  }, [selectedStationId]);

  useEffect(() => {
    setActivePart(stationParts(station?.code)[0]);
    setEnergy(null);
    setEnvironment(null);
    setUnits([]);
    setAlerts([]);
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load, station?.code]);

  useEffect(() => {
    const onEnergy = (reading) => {
      if (reading.station === selectedStationId) setEnergy(reading);
    };
    const onEnvironment = (reading) => {
      if (reading.station === selectedStationId) setEnvironment(reading);
    };
    const onInfrastructure = (unit) => {
      if (unit.station !== selectedStationId) return;
      setUnits((current) => current.some((item) => item._id === unit._id)
        ? current.map((item) => item._id === unit._id ? unit : item)
        : [...current, unit]);
    };
    const onAlert = (alert) => {
      if (alert.station !== selectedStationId) return;
      setAlerts((current) => [alert, ...current.filter((item) => item._id !== alert._id)].slice(0, 5));
    };
    socket.on('energy:new', onEnergy);
    socket.on('environment:new', onEnvironment);
    socket.on('infrastructure:update', onInfrastructure);
    socket.on('alert:new', onAlert);
    return () => {
      socket.off('energy:new', onEnergy);
      socket.off('environment:new', onEnvironment);
      socket.off('infrastructure:update', onInfrastructure);
      socket.off('alert:new', onAlert);
    };
  }, [selectedStationId]);

  const activeUnit = useMemo(() => {
    if (!activePart?.infra) return null;
    return units.find((unit) => unit.type === activePart.infra)
      || units.find((unit) => unit.unitName.toLowerCase().includes(activePart.infra.toLowerCase()));
  }, [activePart, units]);

  async function sendAlert() {
    if (!isOperator || !station || !activePart) return;
    setSending(true);
    setNotice('');
    try {
      const response = await client.post('/alerts', {
        station: station._id,
        module: activePart.module,
        severity: 'Medium',
        message: `Operator inspection alert: ${activePart.label} requires attention at ${station.name}.`
      });
      setAlerts((current) => [response.data, ...current].slice(0, 5));
      setNotice('Alert sent to this station’s live alert feed.');
    } catch (err) {
      setNotice(err.response?.data?.error || 'Could not send alert.');
    } finally {
      setSending(false);
    }
  }

  const output = activePart?.id === 'power' || activePart?.id === 'solar' || activePart?.id === 'wind';
  const activeOutput = activePart?.id === 'power' ? energy?.dieselOutputKw
    : activePart?.id === 'solar' ? energy?.solarOutputKw
      : activePart?.id === 'wind' ? energy?.windOutputKw : null;
  const activeTemperature = activeUnit?.internalTempC ?? environment?.tempC;

  return (
    <div className="page station-view-page">
      <div className="page-header">
        <div>
          <h1>Live station view</h1>
          <p className="page-sub">Interactive digital twin. Point to a facility or energy source to inspect live readings.</p>
        </div>
        <div className="live-indicator"><span /> LIVE · updates every 10 seconds</div>
      </div>

      <div className="view-toolbar">
        <span className="cell-muted">VIEW STATION</span>
        {stations.map(({ station: item }) => (
          <button key={item._id} className={'station-pill' + (item._id === selectedStationId ? ' active' : '')} onClick={() => selectStation(item._id)}>
            {item.name} · {item.code}
          </button>
        ))}
      </div>

      {!station ? <div className="panel page-loading">Loading station structure…</div> : <>
        <div className="twin-layout">
          <section className="twin-scene-panel panel" aria-label={`${station.name} interactive 3D station model`}>
            <div className="scene-heading">
              <div><strong>{station.name} Station</strong><span>{station.location?.description || 'Antarctica'}</span></div>
              <span className="scene-coordinate">{station.location?.lat?.toFixed(2)}° / {station.location?.lng?.toFixed(2)}°</span>
            </div>
            <StationModel station={station} parts={parts} activePart={activePart} units={units} onSelect={setActivePart} />
            <div className="scene-legend"><span><i className="legend-ok" /> Operational</span><span><i className="legend-warning" /> Attention</span><span>Hover / focus a structure for live detail</span></div>
          </section>

          <aside className="twin-detail-column">
            <section className="panel detail-panel">
              <div className="panel-title">Live component detail</div>
              <div className="detail-component">{activePart?.label || 'Select a component'}</div>
              <div className="detail-subtitle">{activeUnit?.status || (output ? 'Energy system' : activePart?.module || 'Station telemetry')}</div>
              <div className="detail-metrics">
                <div><span>Temperature</span><strong>{fmt(activeTemperature)}°C</strong></div>
                <div><span>{activePart?.id === 'wind' ? 'Wind speed' : 'Power output'}</span><strong>{activePart?.id === 'wind' ? `${fmt(environment?.windSpeedKmh, 0)} km/h` : `${fmt(activeOutput)} kW`}</strong></div>
                <div><span>Battery reserve</span><strong>{fmt(energy?.batteryPercent, 0)}%</strong></div>
                <div><span>Structure health</span><strong>{activeUnit ? `${fmt(activeUnit.structuralHealthPercent, 0)}%` : '—'}</strong></div>
              </div>
              {activePart?.id === 'power' && <div className="detail-note">Solar {fmt(energy?.solarOutputKw)} kW · Wind {fmt(energy?.windOutputKw)} kW · Diesel {fmt(energy?.dieselOutputKw)} kW</div>}
              {error && <div className="field-error">{error}</div>}
              {isOperator && <button className="btn-primary alert-send" onClick={sendAlert} disabled={sending}>
                {sending ? 'Sending alert…' : `Send alert for ${activePart?.label || 'component'}`}
              </button>}
              {notice && <p className="alert-notice" role="status">{notice}</p>}
            </section>

            <section className="panel alert-panel">
              <div className="alert-panel-heading"><div className="panel-title">Active station alerts</div><span className="alert-count">{alerts.length}</span></div>
              {alerts.length ? alerts.map((alert) => <div className="live-alert-row" key={alert._id}>
                <span className={`severity-dot severity-${alert.severity.toLowerCase()}`} />
                <div><strong>{alert.module}</strong><span>{alert.message}</span></div>
              </div>) : <p className="cell-muted">No active alerts for this station.</p>}
              <a className="alerts-link" href="/alerts">Open alert centre →</a>
            </section>
          </aside>
        </div>
        <div className="view-footnote">Readings stream from the station simulator and update live over Socket.IO. The 3D layout is a prototype visualization, not a surveyed architectural model.</div>
      </>}
    </div>
  );
}
