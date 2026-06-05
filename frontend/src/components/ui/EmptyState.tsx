import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';
import { Button } from './Button';
import { IconBox } from './IconBox';

export function EmptyState({
  actionLabel,
  className,
  description,
  icon,
  onAction,
  title,
  children,
}: {
  actionLabel?: string;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  onAction?: () => void;
  title?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={classNames('gt-surface-ink grid gap-3 rounded-2xl px-6 py-8 text-center', className)} role="status">
      {icon && <IconBox className="mx-auto">{icon}</IconBox>}
      {title && <div className="m-0 text-[1.15rem] font-extrabold leading-[1.25] text-white">{title}</div>}
      {description && <div className="m-0 text-[0.9rem] leading-[1.55] text-slate-400">{description}</div>}
      {children}
      {actionLabel && onAction && (
        <Button type="button" variant="accent" className="mt-1.5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
