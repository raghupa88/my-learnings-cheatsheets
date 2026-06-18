import './StatusBadge.css';

type Status = 'ACTIVE' | 'CONFIRMED' | 'SETTLED' | 'EXPIRED' | 'PENDING' | 'QUOTED' | 'BOOKED';

export function StatusBadge({ status }: { status: Status | string }) {
  const cls = `status-badge status-badge--${status.toLowerCase()}`;
  return <span className={cls}>{status}</span>;
}
