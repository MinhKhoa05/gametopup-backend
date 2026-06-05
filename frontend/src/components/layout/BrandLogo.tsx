import { Gamepad2 } from 'lucide-react';
import { classNames } from '../../lib/ui';
import { IconBox } from '../ui';

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
    <button
      type="button"
      className={classNames('group flex items-center gap-3 border-0 bg-transparent p-0 text-left transition-transform duration-200 hover:-translate-y-0.5', className)}
      onClick={onClick}
    >
      <IconBox size="sm" className="h-10 w-10 transition-all duration-200 group-hover:bg-cyan/15 group-hover:shadow-[0_8px_24px_rgba(34,211,238,0.12)]">
        <Gamepad2 size={24} />
      </IconBox>
      <span className="hidden lg:block">
        <strong className="block text-lg leading-tight text-white">{title}</strong>
        {subtitle ? <small className="block text-sm font-medium leading-tight text-cyan-50">{subtitle}</small> : null}
      </span>
    </button>
  );
}
