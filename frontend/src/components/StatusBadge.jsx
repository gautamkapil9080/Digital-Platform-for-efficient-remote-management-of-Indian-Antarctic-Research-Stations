export default function StatusBadge({ status }) {
  const key = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={'badge badge-status-' + key}>{status}</span>;
}
