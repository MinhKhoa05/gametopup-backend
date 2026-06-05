import { FormEvent } from 'react';
import { Save, ShieldCheck } from 'lucide-react';

import { Button, Field, SectionHeading } from '../ui';

type AccountProfileFormProps = {
  email: string;
  draftName: string;
  saveError: string | null;
  canSave: boolean;
  busy: boolean;
  onDraftNameChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export function AccountProfileForm({
  email,
  draftName,
  saveError,
  canSave,
  busy,
  onDraftNameChange,
  onSubmit,
}: AccountProfileFormProps) {
  return (
    <section className="gt-surface min-h-0">
      <SectionHeading
        className="mb-4"
        title="Thông tin cá nhân"
        description="Cập nhật thông tin hiển thị trên tài khoản của bạn."
      />

      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field
          label="Tên hiển thị"
          value={draftName}
          onChange={(event) => onDraftNameChange(event.target.value)}
          placeholder="Nhập tên hiển thị"
        />

        <Field
          label="Email"
          value={email}
          placeholder={email}
          readOnly
        />

        <div className="flex items-start gap-2 text-sm leading-6 text-slate-400">
          <ShieldCheck size={16} />
          <span>
            Email là định danh đăng nhập. Hệ thống không dùng username.
          </span>
        </div>

        {saveError && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {saveError}
          </div>
        )}

        <div className="flex w-full justify-start gap-2 pt-0.5">
          <Button className="min-w-40" type="submit" variant="accent" disabled={!canSave || busy}>
            <Save size={16} />
            {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </section>
  );
}
