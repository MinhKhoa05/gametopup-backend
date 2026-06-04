import type { ReactNode } from 'react';
import { ArrowRight, Gamepad2, LogOut, WalletCards } from 'lucide-react';
import { IconBox } from '../ui/IconBox';
import { Route } from '../../lib/routes';

type AccountQuickActionsProps = {
  onLogout: () => void;
  navigate: (route: Route) => void;
};

export function AccountQuickActions({ onLogout, navigate }: AccountQuickActionsProps) {
  return (
    <section className="gametopup-surface min-h-0">
      <div className="grid gap-3.5">
        <QuickActionRow
          icon={<WalletCards size={20} />}
          title="Nạp ví"
          description="Nạp thêm tiền vào ví của bạn"
          onClick={() => navigate({ name: 'wallet' })}
        />

        <QuickActionRow
          icon={<Gamepad2 size={20} />}
          title="Lịch sử đơn"
          description="Xem lại các đơn đã đặt"
          onClick={() => navigate({ name: 'orders' })}
        />

        <QuickActionRow
          icon={<WalletCards size={20} />}
          title="Lịch sử nạp tiền"
          description="Xem giao dịch và số dư ví"
          onClick={() => navigate({ name: 'wallet' })}
        />

        <QuickActionRow
          icon={<LogOut size={20} />}
          title="Đăng xuất"
          description="Thoát khỏi tài khoản hiện tại"
          tone="danger"
          onClick={onLogout}
        />
      </div>
    </section>
  );
}

function QuickActionRow({
  description,
  icon,
  onClick,
  title,
  tone = 'default',
}: {
  description: string;
  icon: ReactNode;
  onClick: () => void;
  title: string;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      type="button"
      className="grid w-full grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-slate-400/10 bg-slate-900/50 px-4 py-3.5 text-left text-slate-200 transition-all duration-200 hover:border-cyanline/25 hover:bg-cyanline/10 lg:grid-cols-[44px_minmax(0,1fr)_auto]"
      onClick={onClick}
    >
      <IconBox
        size="sm"
        className={
          tone === 'danger'
            ? 'h-11 w-11 rounded-xl border border-transparent bg-slate-800/80 text-rose-300'
            : 'h-11 w-11 rounded-xl border border-transparent bg-sky-950/80 text-cyanline'
        }
      >
        {icon}
      </IconBox>

      <span className="grid min-w-0 gap-1">
        <strong className="block text-base font-black leading-[1.2] text-white">{title}</strong>
        <small className="block text-sm leading-[1.35] text-slate-400">{description}</small>
      </span>

      <span className="hidden items-center text-slate-200 lg:inline-flex">
        <ArrowRight size={18} />
      </span>
    </button>
  );
}
