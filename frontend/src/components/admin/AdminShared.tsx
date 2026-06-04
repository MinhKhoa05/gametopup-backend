import { CheckCircle2, X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Field } from '../ui/Field';
import { classNames } from '../../lib/ui';
import { SectionHeading } from '../ui/SectionHeading';
import { SearchBar } from '../ui/SearchBar';

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
    <SectionHeading
      action={
        action ? (
          <button type="button" className="inline-flex items-center gap-2 text-cyanline hover:text-cyan-100" onClick={onAction}>
            {action}
          </button>
        ) : null
      }
      title={title}
    />
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
  return <SearchBar className="mb-4" inputClassName="text-sm" value={value} onChange={onChange} placeholder={placeholder} />;
}

export function StatusPill({ active }: { active: boolean }) {
  return (
    <Badge
      className={classNames(
        'inline-flex min-h-0 items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[0.78rem] font-bold whitespace-nowrap',
        active ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-slate-500/20 bg-slate-500/15 text-slate-200',
      )}
      icon={active ? <CheckCircle2 size={14} /> : <X size={14} />}
      tone="default"
    >
      {active ? 'Bật' : 'Tắt'}
    </Badge>
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
  return <Field label={label} min={0} onChange={(next) => onChange(Number(next))} placeholder="0" required type="number" value={String(value)} />;
}

export function AdminSkeleton({ rows }: { rows: number }) {
  return (
    <div className="grid gap-2.5" aria-busy="true" aria-label="Đang tải dữ liệu">
      {Array.from({ length: rows }).map((_, index) => (
        <span
          key={index}
          className="h-[70px] animate-pulse rounded-xl bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.08),rgba(255,255,255,0.04))] bg-[length:220%_100%]"
        />
      ))}
    </div>
  );
}

export function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/12 px-6 py-8 text-slate-400">
      <span>{text}</span>
    </div>
  );
}

export function filterByName<T extends { name: string }>(items: T[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

export function gameName(games: Array<{ id: number; name: string }>, gameId: number) {
  return games.find((game) => game.id === gameId)?.name ?? `Game #${gameId}`;
}
