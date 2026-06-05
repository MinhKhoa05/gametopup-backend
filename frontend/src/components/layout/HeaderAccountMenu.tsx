import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ShieldCheck, UserRound } from 'lucide-react';
import { classNames } from '../../lib/ui';
import { Badge, IconBox } from '../ui';

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
          'gt-interactive inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2',
          open
            ? 'border-cyan/25 bg-cyan/10 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_18px_rgba(34,211,238,0.12)]'
            : 'border-white/10 bg-white/5 text-white',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        <IconBox size="sm" className="h-6 w-6 rounded-full">
          <UserRound size={14} />
        </IconBox>
        <span className="hidden text-sm font-semibold text-white sm:block">{triggerLabel}</span>
        <ChevronDown size={14} className="hidden text-slate-400 transition-transform duration-200 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-white/5 py-2 shadow-[0_20px_48px_rgba(2,6,23,0.45),0_0_0_1px_rgba(34,211,238,0.06)_inset]">
          <div className="grid gap-1 border-b border-white/10 bg-cyan/10 px-3 py-3">
            <div className="min-w-0 grid gap-1">
              <span className="text-base font-bold leading-tight text-white">{infoLabel}</span>
              <Badge variant="success" icon={<ShieldCheck size={14} />}>
                {infoBadge}
              </Badge>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <button
                type="button"
                className={classNames(
                  'gt-interactive flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold',
                  item.className === 'logout'
                    ? 'border-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200'
                    : 'border-transparent text-slate-300 hover:text-white',
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
