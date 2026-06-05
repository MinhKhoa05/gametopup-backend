import { Button, Field, SearchBar, SectionHeading } from '../ui';

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
          <Button className="border-none bg-transparent px-0 py-0 text-cyan hover:bg-transparent hover:text-cyan-50" onClick={onAction}>
            {action}
          </Button>
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
    <Field
      label={label}
      min={0}
      onChange={(event) => onChange(Number(event.target.value))}
      placeholder="0"
      required
      type="number"
      value={String(value)}
    />
  );
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
