export default function StatusBadge({ status }) {
  const map = {
    available: { label: 'Available', cls: 'status-badge-available', dot: 'bg-green-500' },
    full:      { label: 'Full',      cls: 'status-badge-full',      dot: 'bg-red-500' },
    limited:   { label: 'Limited',   cls: 'status-badge-limited',   dot: 'bg-yellow-500' },
    pending:   { label: 'Pending',   cls: 'status-badge-limited',   dot: 'bg-yellow-500' },
    approved:  { label: 'Approved',  cls: 'status-badge-available', dot: 'bg-green-500' },
    rejected:  { label: 'Rejected',  cls: 'status-badge-full',      dot: 'bg-red-500' },
    'in transit': { label: 'In Transit', cls: 'status-badge-available', dot: 'bg-blue-500' },
    completed: { label: 'Completed', cls: 'status-badge-available', dot: 'bg-green-500' },
  };

  const key = status?.toLowerCase() || 'available';
  const config = map[key] || map['available'];

  return (
    <span className={config.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} inline-block`} />
      {config.label}
    </span>
  );
}
