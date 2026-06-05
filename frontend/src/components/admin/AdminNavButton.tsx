import { ReactNode } from 'react';
import { classNames } from '../../lib/ui';
import { IconBox } from '../ui';

export function AdminNavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={classNames(
        'gt-interactive gt-panel-soft group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border-transparent px-3 py-2.5 pr-3 text-left font-semibold text-slate-400 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:bg-transparent',
        active
          ? 'translate-x-px border-cyan/25 bg-cyan/10 text-cyan-50 shadow-[0_12px_24px_rgba(34,211,238,0.08)] before:bg-cyan'
          : 'hover:translate-x-px hover:text-cyan-50',
      )}
      onClick={onClick}
    >
      <IconBox
        size="sm"
        className={classNames(
          'h-8 w-8 rounded-xl transition-colors duration-200',
          active ? 'bg-cyan/15 text-cyan-50' : 'bg-cyan/10 text-cyan group-hover:bg-cyan/15 group-hover:text-cyan-50',
        )}
      >
        {icon}
      </IconBox>
      <span className="min-w-0 whitespace-nowrap text-[0.92rem] leading-[1.2]">{label}</span>
    </button>
  );
}
