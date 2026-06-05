import type { FormEvent } from 'react';
import { Check, ShieldCheck, UserPlus } from 'lucide-react';
import { AuthSliderForm } from '../auth/AuthSliderForm';
import { Button, IconBox } from '../ui';
import { classNames } from '../../lib/ui';
import type { AuthFormData, AuthMode } from '../../types';

type AuthSectionProps = {
  busy: boolean;
  form: AuthFormData;
  authMode: AuthMode;
  onChange: (next: AuthFormData) => void;
  onSubmit: (e: FormEvent) => void;
  onSwitchMode: (mode: AuthMode) => void;
};

export function AuthSection({ busy, form, authMode, onChange, onSubmit, onSwitchMode }: AuthSectionProps) {
  const isRegister = authMode === 'register';

  return (
    <div
      className={classNames(
        'relative z-[1] transform-gpu mx-auto mt-14 mb-8 min-h-[560px] w-full max-w-[860px] overflow-hidden rounded-2xl border border-cyan/10 bg-ink-light shadow-[0_10px_30px_rgba(0,0,0,0.3)]',
        'max-md:min-h-[auto] max-md:max-w-[440px]',
      )}
    >
      <div
        className={classNames(
          'flex flex-col items-center justify-center transition-all duration-500 ease-in-out max-md:relative max-md:w-full max-md:items-stretch max-md:justify-start max-md:px-6 max-md:py-8',
          'absolute left-0 top-0 h-full w-1/2 p-10 md:p-10',
          isRegister
            ? 'md:translate-x-full md:opacity-0 md:z-0 max-md:hidden'
            : 'md:translate-x-0 md:opacity-100 md:z-20 max-md:flex',
        )}
      >
        <AuthSliderForm
          busy={busy}
          form={form}
          mode="login"
          onChange={onChange}
          onSubmit={(e) => {
            e.preventDefault();
            onSwitchMode('login');
            onSubmit(e);
          }}
          onSwitchMode={onSwitchMode}
        />
      </div>

      <div
        className={classNames(
          'flex flex-col items-center justify-center transition-all duration-500 ease-in-out max-md:relative max-md:w-full max-md:items-stretch max-md:justify-start max-md:px-6 max-md:py-8',
          'absolute left-0 top-0 h-full w-1/2 p-10 md:p-10',
          isRegister
            ? 'md:translate-x-full md:opacity-100 md:z-50 max-md:flex'
            : 'md:translate-x-0 md:opacity-0 md:z-10 max-md:hidden',
        )}
      >
        <AuthSliderForm
          busy={busy}
          form={form}
          mode="register"
          onChange={onChange}
          onSubmit={(e) => {
            e.preventDefault();
            onSwitchMode('register');
            onSubmit(e);
          }}
          onSwitchMode={onSwitchMode}
        />
      </div>

      <div
        className={classNames(
          'hidden overflow-hidden border-l border-cyan/10 transition-transform duration-500 ease-in-out md:absolute md:left-1/2 md:top-0 md:z-50 md:block md:h-full md:w-1/2',
          isRegister ? 'md:-translate-x-full md:border-l-0 md:border-r' : 'md:translate-x-0',
        )}
      >
        <div
          className={classNames(
            'relative -left-full h-full w-[200%] transition-transform duration-500 ease-in-out md:bg-[linear-gradient(135deg,rgba(13,31,54,0.56),rgba(7,17,31,0.9))]',
            isRegister ? 'md:translate-x-1/2' : 'md:translate-x-0',
          )}
        >
          <div
            className={classNames(
              'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center p-10 text-center transition-transform duration-500 ease-in-out',
              isRegister ? 'md:translate-x-0' : 'md:-translate-x-[20%]',
            )}
          >
            <IconBox size="lg" className="mb-4 bg-white/10 text-white">
              <UserPlus size={28} />
            </IconBox>
            <h2 className="mb-3.5 text-3xl font-black text-white">Chào bạn mới!</h2>
            <p className="mb-6 leading-6 text-slate-400">
              Đăng ký ngay để trải nghiệm dịch vụ nạp game chiết khấu cao và tiện lợi nhất.
            </p>
            <ul className="my-4 flex flex-col gap-2 text-left text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" /> Chiết khấu nạp game hấp dẫn
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" /> Thanh toán đa kênh tiện lợi
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" /> Hỗ trợ khách hàng 24/7
              </li>
            </ul>
            <Button className="mt-2" onClick={() => onSwitchMode('login')}>
              Đã có tài khoản?
            </Button>
          </div>

          <div
            className={classNames(
              'absolute top-0 flex h-full w-1/2 flex-col items-center justify-center p-10 text-center transition-transform duration-500 ease-in-out',
              'right-0',
              isRegister ? 'md:translate-x-[20%]' : 'md:translate-x-0',
            )}
          >
            <IconBox size="lg" className="mb-4 bg-white/10 text-white">
              <ShieldCheck size={28} />
            </IconBox>
            <h2 className="mb-3.5 text-3xl font-black text-white">Mừng trở lại!</h2>
            <p className="mb-6 leading-6 text-slate-400">Quản lý ví và theo dõi lịch sử đơn hàng của bạn.</p>
            <ul className="my-4 flex flex-col gap-2 text-left text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" /> Quản lý số dư ví
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" /> Theo dõi trạng thái đơn hàng
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-emerald-400" /> Thanh toán nhanh hơn
              </li>
            </ul>
            <Button className="mt-2" onClick={() => onSwitchMode('register')}>
              Tạo tài khoản mới
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
