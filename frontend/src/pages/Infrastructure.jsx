import { useEffect, useState } from 'react';
import { useStations } from '../context/StationContext';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import socket from '../api/socket';
import StatusBadge from '../components/StatusBadge';

export default function Infrastructure() {
  const { selectedStationId } = useStations();
  const { isOperator } = useAuth();
  const [units, setUnits] = useState([]);

  useEffect(() => {
    if (!selectedStationId) return;
    let cancelled = false;
    client.get(`/infrastructure/station/${selectedStationId}`).then((res) => {
      if (!cancelled) setUnits(res.data);
    });
    return () => { cancelled = true; };
  }, [selectedStationId]);

  useEffect(() => {
    function onUpdate(unit) {
      if (unit.station !== selectedStationId) return;
      setUnits((prev) => {
        const exists = prev.some((u) => u._id === unit._id);
        return exists ? prev.map((u) => (u._id === unit._id ? unit : u)) : [...prev, unit];
      });
    }
    socket.on('infrastructure:update', onUpdate);
    return () => socket.off('infrastructure:update', onUpdate);
  }, [selectedStationId]);

  async function markInspected(unit) {
    const res = await client.put(`/infrastructure/${unit._id}`, { status: 'Operational', structuralHealthPercent: 95 });
    setUnits((prev) => prev.map((u) => (u._id === unit._id ? res.data : u)));
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Infrastructure</h1>
          <p className="page-sub">Structural health of each facility unit</p>
        </div>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Type</th>
              <th>Status</th>
              <th>Structural health</th>
              <th>Internal temp</th>
              <th>Last inspection</th>
              {isOperator && <th></th>}
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr key={u._id}>
                <td>{u.unitName}</td>
                <td className="cell-muted">{u.type}</td>
                <td><StatusBadge status={u.status} /></td>
                <td>
                  <div className="health-bar">
                    <div
                      className={'health-fill' + (u.structuralHealthPercent < 40 ? ' fill-critical' : u.structuralHealthPercent < 70 ? ' fill-warning' : ' fill-ok')}
                      style={{ width: `${u.structuralHealthPercent}%` }}
                    />
                  </div>
                  <span className="cell-mono">{u.structuralHealthPercent.toFixed(0)}%</span>
                </td>
                <td className="cell-mono">{u.internalTempC.toFixed(1)}&deg;C</td>
                <td className="cell-muted">{new Date(u.lastInspection).toLocaleString()}</td>
                {isOperator && (
                  <td>
                    {u.status !== 'Operational' && (
                      <button className="btn-small" onClick={() => markInspected(u)}>Mark inspected</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {units.length === 0 && (
              <tr><td colSpan={isOperator ? 7 : 6} className="cell-muted">No infrastructure units recorded for this station yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
