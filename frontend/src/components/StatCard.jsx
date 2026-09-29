export default function StatCard({ label, value, unit, tone = 'neutral', hint }) {
  return (
    <div className={'stat-card tone-' + tone}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
