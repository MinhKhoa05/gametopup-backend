import type { FormEvent } from 'react';
import { Check, ShieldCheck, UserPlus } from 'lucide-react';
import { AuthSliderForm } from '../auth/AuthSliderForm';
import { IconBox } from '../ui/IconBox';
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

export function AuthSection({
  busy,
  form,
  authMode,
  onChange,
  onSubmit,
  onSwitchMode,
}: AuthSectionProps) {
  return (
    <div className={classNames('auth-page-slider !w-full', authMode === 'register' && 'right-panel-active')}>
      <div className="slider-form-container login-container">
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

      <div className="slider-form-container register-container">
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

      <div className="slider-overlay-container">
        <div className="slider-overlay">
          <div className="slider-overlay-panel overlay-left">
            <IconBox size="lg" className="mb-4 bg-white/10 text-white">
              <UserPlus size={28} />
            </IconBox>
            <h2>Chào bạn mới!</h2>
            <p>Đăng ký ngay để trải nghiệm dịch vụ nạp game chiết khấu cao và tiện lợi nhất.</p>
            <ul className="my-4 flex flex-col gap-2 text-left text-sm text-[#b0bfd3]">
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Chiết khấu nạp game hấp dẫn</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Thanh toán đa kênh tiện lợi</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Hỗ trợ khách hàng 24/7</li>
            </ul>
            <button className="btn-outline mt-2" onClick={() => onSwitchMode('login')} type="button">
              Đã có tài khoản?
            </button>
          </div>

          <div className="slider-overlay-panel overlay-right">
            <IconBox size="lg" className="mb-4 bg-white/10 text-white">
              <ShieldCheck size={28} />
            </IconBox>
            <h2>Mừng trở lại!</h2>
            <p>Quản lý ví và theo dõi lịch sử đơn hàng của bạn.</p>
            <ul className="my-4 flex flex-col gap-2 text-left text-sm text-[#b0bfd3]">
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Quản lý số dư ví</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Theo dõi trạng thái đơn hàng</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-400" /> Thanh toán nhanh hơn</li>
            </ul>
            <button className="btn-outline mt-2" onClick={() => onSwitchMode('register')} type="button">
              Tạo tài khoản mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}