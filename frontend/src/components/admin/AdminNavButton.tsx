import { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

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
        'group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border border-transparent bg-[rgba(255,255,255,0.025)] px-3 py-2.5 pr-3 text-left font-semibold text-[#a5b3c7] transition-[background-color,border-color,transform,color,box-shadow] duration-200 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:bg-transparent',
        active
          ? 'translate-x-px border-cyanline/24 bg-cyanline/10 text-[#cffafe] shadow-[0_12px_24px_rgba(34,211,238,0.08)] before:bg-[linear-gradient(180deg,#67e8f9,#22d3ee)]'
          : 'hover:translate-x-px hover:border-cyanline/24 hover:bg-cyanline/10 hover:text-[#cffafe] hover:shadow-[0_12px_24px_rgba(34,211,238,0.08)]',
      )}
      onClick={onClick}
    >
      <span
        className={classNames(
          'inline-flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-cyanline/10 text-[#67e8f9] transition-colors duration-200',
          active ? 'bg-cyanline/16 text-[#cffafe]' : 'group-hover:bg-cyanline/16 group-hover:text-[#cffafe]',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 whitespace-nowrap text-[0.92rem] leading-[1.2]">{label}</span>
    </button>
  );
}
