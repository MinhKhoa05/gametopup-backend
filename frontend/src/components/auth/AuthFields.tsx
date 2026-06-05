import { Button, Field } from '../ui';
import { classNames } from '../../lib/ui';
import type { AuthFormState, AuthMode } from '../../types';

export type AuthFieldsProps = {
  mode: AuthMode;
  busy: boolean;
  form: AuthFormState;
  onChange: (form: AuthFormState) => void;
  submitClassName?: string;
};

export function AuthFields({ mode, busy, form, onChange, submitClassName = '' }: AuthFieldsProps) {
  const isRegister = mode === 'register';

  return (
    <>
      {isRegister && (
        <Field
          label="Tên hiển thị"
          value={form.displayName}
          onChange={(event) => onChange({ ...form, displayName: event.target.value })}
          placeholder="Nguyễn Văn A"
        />
      )}

      <Field
        label="Email"
        value={form.email}
        onChange={(event) => onChange({ ...form, email: event.target.value })}
        placeholder="customer01@gametopup.com"
        type="email"
      />

      <Field
        label="Mật khẩu"
        value={form.password}
        onChange={(event) => onChange({ ...form, password: event.target.value })}
        placeholder="Nhập mật khẩu"
        type="password"
      />

      <Button className={classNames('w-full text-lg', submitClassName)} type="submit" variant="accent" disabled={busy}>
        {busy ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
      </Button>
    </>
  );
}
