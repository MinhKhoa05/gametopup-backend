import { classNames } from '../../lib/ui';

export const inputControlClassName =
  'w-full min-h-12 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.025)] px-4 text-base text-[#dbe7f5] outline-none shadow-none transition-all duration-200 placeholder:text-slate-500 hover:border-cyanline/35 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_18px_rgba(34,211,238,0.12)] focus:border-cyanline/50 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_0_3px_rgba(34,211,238,0.10),0_0_22px_rgba(34,211,238,0.16)] disabled:cursor-not-allowed disabled:opacity-70 read-only:cursor-default read-only:opacity-95 [appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none';

export function Field({
  className,
  label,
  min,
  readOnly,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  className?: string;
  label: string;
  min?: number;
  readOnly?: boolean;
  required?: boolean;
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className={classNames('mb-4 block', className)}>
      <span className="mb-2 block text-[0.92rem] font-semibold tracking-[0.01em] text-slate-200">{label}</span>
      <input
        className={inputControlClassName}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        min={min}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        type={type}
      />
    </label>
  );
}
