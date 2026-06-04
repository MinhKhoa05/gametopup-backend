import type { CSSProperties, ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export type IconBoxSize = 'sm' | 'md' | 'lg';

export function IconBox({
  children,
  className,
  style,
  size = 'md',
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: IconBoxSize;
}) {
  return (
    <div
      className={classNames(
        'inline-flex flex-none items-center justify-center rounded-xl bg-cyanline/12 text-cyanline',
        size === 'sm' && 'h-9 w-9 rounded-[11px]',
        size === 'md' && 'h-12 w-12 rounded-xl',
        size === 'lg' && 'h-14 w-14 rounded-2xl',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
