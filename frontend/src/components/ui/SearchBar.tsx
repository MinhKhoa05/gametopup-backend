import type { ChangeEvent, KeyboardEventHandler } from 'react';
import { Search } from 'lucide-react';
import { classNames } from '../../lib/ui';
import { inputControlClassName } from './Field';

export function SearchBar({
  ariaLabel,
  className,
  dense = false,
  inputClassName,
  onChange,
  onEnter,
  placeholder,
  size = 16,
  value,
}: {
  ariaLabel?: string;
  className?: string;
  dense?: boolean;
  inputClassName?: string;
  onChange: (value: string) => void;
  onEnter?: (value: string) => void;
  placeholder: string;
  size?: number;
  value: string;
}) {
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      onEnter?.(value);
    }
  };

  return (
    <label
      className={classNames(
        dense
          ? 'flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.025)] px-3.5 text-[#dbe7f5] shadow-none transition-all duration-200 hover:border-cyanline/35 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_18px_rgba(34,211,238,0.12)] focus-within:border-cyanline/50 focus-within:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_0_3px_rgba(34,211,238,0.10),0_0_22px_rgba(34,211,238,0.16)]'
          : 'flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.025)] px-4 text-[#dbe7f5] shadow-none transition-all duration-200 hover:border-cyanline/35 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_18px_rgba(34,211,238,0.12)] focus-within:border-cyanline/50 focus-within:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_0_3px_rgba(34,211,238,0.10),0_0_22px_rgba(34,211,238,0.16)]',
        className,
      )}
      aria-label={ariaLabel}
    >
      <Search size={size} className="pointer-events-none shrink-0 text-cyanline" />
      <input
        className={classNames(
          inputControlClassName,
          dense
            ? 'min-h-0 border-0 bg-transparent px-0 text-sm shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:bg-transparent focus:shadow-none'
            : 'min-h-0 border-0 bg-transparent px-0 shadow-none hover:border-transparent hover:bg-transparent hover:shadow-none focus:border-transparent focus:bg-transparent focus:shadow-none',
          inputClassName,
        )}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </label>
  );
}
