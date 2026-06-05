import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import type { AuthFormData, AuthMode } from '../../types';
import { classNames } from '../../lib/ui';
import { Button } from '../ui';

const defaultForm: AuthFormData = {
  displayName: '',
  email: 'customer01@gametopup.com',
  password: 'Password123!',
};

type AuthFormProps = {
  mode: AuthMode;
  busy: boolean;
  onSubmitAuth: (payload: { form: AuthFormData; mode: AuthMode }) => void;
  onSwitchMode?: (mode: AuthMode) => void;
  className?: string;
};

export function AuthForm({ mode, busy, onSubmitAuth, onSwitchMode, className = '' }: AuthFormProps) {
  const [form, setForm] = useState<AuthFormData>(defaultForm);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      <form
        className="grid h-full gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (isRegister && confirmPassword !== form.password) {
            setError('Mật khẩu xác nhận chưa khớp.');
            return;
          }
          setError('');
          onSubmitAuth({ form, mode });
        }}
      >
        {isRegister ? (
          <AuthTextField
            label="Tên hiển thị"
            value={form.displayName}
            onChange={(event) => setForm({ ...form, displayName: event.target.value })}
            placeholder="Nguyễn Văn A"
            icon={<UserRound size={18} />}
          />
        ) : null}

        <AuthTextField
          label="Email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="Nhập email của bạn"
          type="email"
          icon={<Mail size={18} />}
        />

        <AuthTextField
          label="Mật khẩu"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="Nhập mật khẩu"
          type={showPassword ? 'text' : 'password'}
          icon={<Lock size={18} />}
          trailing={
            <button
              type="button"
              className="text-slate-400 transition-colors hover:text-slate-200"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          }
        />

        {isRegister ? (
          <AuthTextField
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Nhập lại mật khẩu"
            type={showPassword ? 'text' : 'password'}
            icon={<Lock size={18} />}
            trailing={
              <button
                type="button"
                className="text-slate-400 transition-colors hover:text-slate-200"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            }
          />
        ) : null}

        {!isRegister ? (
          <div className="flex items-center justify-between gap-3 text-[0.88rem]">
            <label className="inline-flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-4 rounded border-white/15 bg-white/5 text-cyan focus:ring-cyan"
              />
              Ghi nhớ đăng nhập
            </label>
            <button type="button" className="font-semibold text-cyan transition-colors hover:text-cyan-50">
              Quên mật khẩu?
            </button>
          </div>
        ) : null}

        {error ? <p className="text-sm font-medium text-rose-300">{error}</p> : null}

        <Button className="w-full text-base" type="submit" variant="accent" disabled={busy}>
          {busy ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
        </Button>

        {!isRegister ? <div className="h-px bg-white/6" aria-hidden="true" /> : null}

        {!isRegister ? <SocialLoginBlock /> : null}

        {onSwitchMode ? (
          <div className="pt-1 text-center text-[0.88rem] text-slate-400">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              type="button"
              onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
              className="font-bold text-cyan transition-colors hover:text-cyan-50"
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}

function SocialLoginBlock() {
  return (
    <div className="grid gap-3.5 rounded-2xl px-0 py-0">
      <div className="flex items-center gap-3 text-[0.82rem] text-slate-400">
        <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
        <span className="whitespace-nowrap">Hoặc đăng nhập với</span>
        <span className="h-px flex-1 bg-white/8" aria-hidden="true" />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled
          className="h-11 flex-1 justify-center gap-2 px-4 text-[0.93rem] font-semibold"
        >
          <span className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[#4285F4]/15 text-[0.92rem] font-black text-[#4285F4]">
              G
            </span>
            Google
          </span>
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled
          className="h-11 flex-1 justify-center gap-2 px-4 text-[0.93rem] font-semibold"
        >
          <span className="inline-flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[#1877F2]/15 text-[0.92rem] font-black text-[#1877F2]">
              f
            </span>
            Facebook
          </span>
        </Button>
      </div>
    </div>
  );
}

function AuthTextField({
  label,
  icon,
  trailing,
  className,
  ...props
}: {
  label: string;
  icon: ReactNode;
  trailing?: ReactNode;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.9rem] font-semibold text-slate-200">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">{icon}</span>
        <input
          className={classNames(
            'w-full min-h-10 rounded-2xl border border-white/10 bg-white/5 px-5 text-[0.95rem] text-slate-200 outline-none placeholder:text-slate-500 transition-all duration-200 hover:border-cyan/25 hover:bg-cyan/10 focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] disabled:cursor-not-allowed disabled:opacity-70',
            trailing ? 'pl-12 pr-12' : 'pl-12',
            className,
          )}
          {...props}
        />
        {trailing ? <span className="absolute inset-y-0 right-4 flex items-center">{trailing}</span> : null}
      </div>
    </label>
  );
}
