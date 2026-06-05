import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';
import { IconBox } from './IconBox';

export function StatCard({
  className,
  iconClassName,
  icon,
  label,
  surface = true,
  variant = 'stacked',
  value,
}: {
  className?: string;
  iconClassName?: string;
  icon: ReactNode;
  label: ReactNode;
  surface?: boolean;
  variant?: 'stacked' | 'inline';
  value: ReactNode;
  }) {
  const rootClassName = classNames(
    surface && 'gt-surface-ink rounded-2xl',
    'grid min-w-0 gap-4',
    variant === 'stacked' ? 'p-5' : 'grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-4',
    className,
  );

  return (
    <div className={rootClassName}>
      <IconBox className={iconClassName}>{icon}</IconBox>
      <div className={classNames('grid min-w-0 gap-2', variant === 'inline' && 'gap-1')}>
        <span className="block font-extrabold leading-[1.25] text-slate-400">{label}</span>
        <strong
          className={classNames(
            'block break-words font-black leading-[1.1] text-white',
            variant === 'stacked'
              ? 'text-[clamp(1.35rem,2.4vw,2rem)]'
              : 'text-[clamp(1.2rem,1.9vw,1.65rem)]',
          )}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}
