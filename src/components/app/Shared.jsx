export function SummaryList({ title, items }) {
  return (
    <div className="summary-list">
      <p className="content-label">{title}</p>
      {items.length ? (
        items.slice(0, 5).map((item) => <p key={item}>{item}</p>)
      ) : (
        <p className="muted-copy">No items saved yet.</p>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const labelMap = {
    idle: "Ready",
    loading: "Working",
    success: "Saved",
    error: "Error",
  };

  return (
    <span className={`status-badge status-${status}`}>
      {labelMap[status] ?? "Ready"}
    </span>
  );
}
