// Minimal CSV writer - no extra dependency needed for this.
function toCSV(rows, columns) {
  const escape = (val) => {
    const s = val === null || val === undefined ? '' : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => escape(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escape(c.get(row))).join(','));
  return [header, ...lines].join('\n');
}

module.exports = { toCSV };
