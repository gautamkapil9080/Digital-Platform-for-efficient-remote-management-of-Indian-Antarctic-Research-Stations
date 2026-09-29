import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function formatTime(t) {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// series: [{ dataKey, name, color }]
export default function ChartCard({ title, data, series, yUnit }) {
  return (
    <div className="panel">
      <div className="panel-title">{title}</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--grid-line)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="timestamp" tickFormatter={formatTime} stroke="var(--text-muted)" fontSize={11} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} unit={yUnit || ''} width={44} />
          <Tooltip
            labelFormatter={formatTime}
            contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--grid-line)', borderRadius: 4, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s) => (
            <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
