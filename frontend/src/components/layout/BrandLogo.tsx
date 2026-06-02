import { Gamepad2 } from 'lucide-react';
import { classNames } from '../../lib/ui';

export function BrandLogo({
  className,
  onClick,
  subtitle,
  title,
}: {
  className?: string;
  onClick: () => void;
  subtitle?: string;
  title: string;
}) {
  return (
    <button type="button" className={classNames('brand-logo', className)} onClick={onClick}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyanline/20 text-cyanline">
        <Gamepad2 size={24} />
      </span>
      <span className="hidden lg:block">
        <strong className="block text-lg leading-tight text-white">{title}</strong>
        {subtitle ? <small className="block text-sm font-medium leading-tight text-cyanline/90">{subtitle}</small> : null}
      </span>
    </button>
  );
}
