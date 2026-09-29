import { useEffect, useState } from 'react';
import { useStations } from '../context/StationContext';
import { useAuth } from '../context/AuthContext';
import client, { downloadExport } from '../api/client';
import socket from '../api/socket';

export default function Logistics() {
  const { selectedStationId } = useStations();
  const { isOperator } = useAuth();
  const [items, setItems] = useState([]);
  const [restockAmount, setRestockAmount] = useState({});

  useEffect(() => {
    if (!selectedStationId) return;
    let cancelled = false;
    client.get(`/logistics/station/${selectedStationId}`).then((res) => {
      if (!cancelled) setItems(res.data);
    });
    return () => { cancelled = true; };
  }, [selectedStationId]);

  useEffect(() => {
    function onUpdate(item) {
      if (item.station !== selectedStationId) return;
      setItems((prev) => {
        const exists = prev.some((i) => i._id === item._id);
        return exists ? prev.map((i) => (i._id === item._id ? item : i)) : [...prev, item];
      });
    }
    socket.on('logistics:update', onUpdate);
    return () => socket.off('logistics:update', onUpdate);
  }, [selectedStationId]);

  async function restock(item) {
    const amount = Number(restockAmount[item._id]) || 0;
    if (amount <= 0) return;
    const res = await client.put(`/logistics/${item._id}/restock`, { amount });
    setItems((prev) => prev.map((i) => (i._id === item._id ? res.data : i)));
    setRestockAmount((prev) => ({ ...prev, [item._id]: '' }));
  }

  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Logistics & supply</h1>
          <p className="page-sub">Inventory levels across food, fuel, medical and spare-part stock</p>
        </div>
        <div className="export-buttons">
          <button className="btn-small" onClick={() => downloadExport('logistics', selectedStationId, 'csv')}>Export CSV</button>
          <button className="btn-small" onClick={() => downloadExport('logistics', selectedStationId, 'pdf')}>Export PDF</button>
        </div>
      </div>

      {categories.map((cat) => (
        <div className="panel" key={cat}>
          <div className="panel-title">{cat}</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Reorder threshold</th>
                <th>Last restocked</th>
                {isOperator && <th>Restock</th>}
              </tr>
            </thead>
            <tbody>
              {items.filter((i) => i.category === cat).map((item) => {
                const low = item.quantity <= item.reorderThreshold;
                return (
                  <tr key={item._id}>
                    <td>{item.itemName}</td>
                    <td className={low ? 'cell-critical' : 'cell-mono'}>{item.quantity} {item.unit}</td>
                    <td className="cell-muted">{item.reorderThreshold} {item.unit}</td>
                    <td className="cell-muted">{new Date(item.lastRestocked).toLocaleDateString()}</td>
                    {isOperator && (
                      <td className="restock-cell">
                        <input
                          type="number"
                          min="0"
                          placeholder="Amount"
                          value={restockAmount[item._id] || ''}
                          onChange={(e) => setRestockAmount((prev) => ({ ...prev, [item._id]: e.target.value }))}
                        />
                        <button className="btn-small" onClick={() => restock(item)}>Add stock</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {items.length === 0 && <div className="panel"><p className="cell-muted">No inventory recorded for this station yet.</p></div>}
    </div>
  );
}
