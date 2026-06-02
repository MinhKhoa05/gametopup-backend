import { CheckCircle2, Search, X } from 'lucide-react';
import { ReactNode } from 'react';
import { classNames } from '../../../lib/ui';

export function MetricCard({
  icon,
  label,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  tone?: 'warning';
  value: string;
}) {
  return (
    <div className={classNames('admin-metric-card', tone === 'warning' && 'warning')}>
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

export function PanelTitle({
  action,
  onAction,
  title,
}: {
  action?: string;
  onAction?: () => void;
  title: string;
}) {
  return (
    <div className="admin-panel-title">
      <h2>{title}</h2>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

export function SearchBox({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <div className="search-box admin-search">
      <Search size={17} />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={classNames('admin-status-pill', active ? 'active' : 'inactive')}>
      {active ? <CheckCircle2 size={14} /> : <X size={14} />}
      {active ? 'Bật' : 'Tắt'}
    </span>
  );
}

export function NumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input min={0} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} required />
    </label>
  );
}

export function AdminSkeleton({ rows }: { rows: number }) {
  return (
    <div className="admin-skeleton" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function EmptyLine({ text }: { text: string }) {
  return <div className="admin-empty-line">{text}</div>;
}

export function filterByName<T extends { name: string }>(items: T[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

export function gameName(games: Array<{ id: number; name: string }>, gameId: number) {
  return games.find((game) => game.id === gameId)?.name ?? `Game #${gameId}`;
}
