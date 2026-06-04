import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ShieldCheck, UserRound } from 'lucide-react';
import { classNames } from '../../lib/ui';
import { Badge } from '../ui/Badge';

export type HeaderAccountMenuItem = {
  className?: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  dividerAfter?: boolean;
};

export function HeaderAccountMenu({
  infoLabel,
  infoBadge,
  items,
  triggerLabel,
}: {
  infoLabel: string;
  infoBadge: string;
  items: HeaderAccountMenuItem[];
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-expanded={open}
        className={classNames(
          'inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200',
          open
            ? 'border-cyanline/35 bg-[rgba(255,255,255,0.025)] text-sky-50 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_18px_rgba(34,211,238,0.12)]'
            : 'border-white/10 bg-[rgba(255,255,255,0.025)] text-white hover:-translate-y-0.5 hover:border-cyanline/35 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_18px_rgba(34,211,238,0.12)]',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyanline/15 bg-cyanline/10 text-cyanline">
          <UserRound size={14} />
        </div>
        <span className="hidden text-sm font-semibold text-white sm:block">{triggerLabel}</span>
        <ChevronDown size={14} className="hidden text-slate-400 transition-transform duration-200 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.025)] py-2 shadow-[0_20px_48px_rgba(2,6,23,0.45),0_0_0_1px_rgba(34,211,238,0.06)_inset]">
          <div className="grid gap-1 border-b border-white/10 bg-cyanline/[0.03] px-3 py-3">
            <div className="min-w-0 grid gap-1">
              <span className="text-[0.98rem] font-bold leading-tight text-white">{infoLabel}</span>
              <Badge tone="success" icon={<ShieldCheck size={14} />}>
                {infoBadge}
              </Badge>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <button
                type="button"
                className={classNames(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors',
                  item.className === 'logout'
                    ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200'
                    : 'text-slate-300 hover:bg-cyanline/8 hover:text-white',
                )}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
              {item.dividerAfter ? <div className="my-1 h-px bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
