import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export type BadgeTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export function Badge({
  children,
  className,
  icon,
  tone = 'default',
  }: {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  tone?: BadgeTone;
  }) {
  const toneClassName =
    tone === 'info'
      ? 'border-sky-400/25 bg-sky-400/10 text-sky-200'
      : tone === 'success'
        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
        : tone === 'warning'
          ? 'border-amber-400/25 bg-amber-400/10 text-amber-200'
          : tone === 'danger'
            ? 'border-rose-400/25 bg-rose-400/10 text-rose-200'
            : 'border-cyanline/22 bg-cyanline/10 text-cyan-50';

  return (
    <span className={classNames('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.8rem] font-bold', toneClassName, className)}>
      {icon}
      {children}
    </span>
  );
}
