import { useEffect, useState } from 'react';
import { useStations } from '../context/StationContext';
import { useAuth } from '../context/AuthContext';
import client, { downloadExport } from '../api/client';
import socket from '../api/socket';
import SeverityBadge from '../components/SeverityBadge';

export default function Alerts() {
  const { selectedStationId } = useStations();
  const { isOperator } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    if (!selectedStationId) return;
    let cancelled = false;
    const params = { station: selectedStationId };
    if (!showResolved) params.resolved = 'false';
    client.get('/alerts', { params }).then((res) => {
      if (!cancelled) setAlerts(res.data);
    });
    return () => { cancelled = true; };
  }, [selectedStationId, showResolved]);

  useEffect(() => {
    function onNew(alert) {
      if (alert.station !== selectedStationId) return;
      setAlerts((prev) => [alert, ...prev]);
    }
    function onResolved(alert) {
      if (alert.station !== selectedStationId) return;
      if (showResolved) {
        setAlerts((prev) => prev.map((a) => (a._id === alert._id ? alert : a)));
      } else {
        setAlerts((prev) => prev.filter((a) => a._id !== alert._id));
      }
    }
    socket.on('alert:new', onNew);
    socket.on('alert:resolved', onResolved);
    return () => {
      socket.off('alert:new', onNew);
      socket.off('alert:resolved', onResolved);
    };
  }, [selectedStationId, showResolved]);

  async function resolve(alert) {
    await client.put(`/alerts/${alert._id}/resolve`);
    setAlerts((prev) => (showResolved ? prev : prev.filter((a) => a._id !== alert._id)));
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Alerts</h1>
          <p className="page-sub">Automatically raised whenever a monitored value crosses a safe threshold</p>
        </div>
        <div className="export-buttons">
          <label className="toggle-label">
            <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
            Show resolved
          </label>
          <button className="btn-small" onClick={() => downloadExport('alerts', selectedStationId, 'csv')}>Export CSV</button>
          <button className="btn-small" onClick={() => downloadExport('alerts', selectedStationId, 'pdf')}>Export PDF</button>
        </div>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Module</th>
              <th>Message</th>
              <th>Raised</th>
              {isOperator && <th></th>}
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a._id} className={a.resolved ? 'row-resolved' : ''}>
                <td><SeverityBadge severity={a.severity} /></td>
                <td className="cell-muted">{a.module}</td>
                <td>{a.message}</td>
                <td className="cell-muted">{new Date(a.timestamp).toLocaleString()}</td>
                {isOperator && (
                  <td>{!a.resolved && <button className="btn-small" onClick={() => resolve(a)}>Resolve</button>}</td>
                )}
              </tr>
            ))}
            {alerts.length === 0 && (
              <tr><td colSpan={isOperator ? 5 : 4} className="cell-muted">No {showResolved ? '' : 'open '}alerts for this station.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
