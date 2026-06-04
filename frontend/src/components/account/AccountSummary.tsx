import { Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { IconBox } from '../ui/IconBox';
import { StatCard } from '../ui/StatCard';
import { formatCurrency } from '../../lib/format';
import { userDisplayName } from '../../lib/labels';
import type { User, WalletInfo } from '../../types';

function isAdminUser(user: User) {
  if (typeof user.role === 'string') {
    return user.role.toLowerCase().includes('admin');
  }

  return user.role === 1;
}

type AccountSummaryProps = {
  user: User;
  wallet: WalletInfo | null;
  ordersCount: number;
};

export function AccountSummary({ user, wallet, ordersCount }: AccountSummaryProps) {
  const displayName = userDisplayName(user);
  const roleLabel = isAdminUser(user) ? 'Quản trị viên' : 'Tài khoản cá nhân';
  const statusLabel = user.isActive === false ? 'Tạm khóa' : 'Đang hoạt động';

  return (
    <div className="grid gap-0 px-4 pt-5 pb-6 md:p-5 lg:px-6 lg:pt-5 lg:pb-6">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_1px_minmax(0,1fr)] lg:gap-0">
        <div className="grid grid-cols-1 items-center gap-4 pr-0 md:grid-cols-[auto_minmax(0,1fr)] md:justify-items-start lg:pr-6">
          <IconBox
            size="lg"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, rgba(34, 211, 238, 0.24), transparent 55%), rgba(34, 211, 238, 0.1)',
            }}
            className="!h-24 !w-24 !rounded-full !border !border-cyanline/20 !text-cyanline !shadow-[inset_0_0_28px_rgba(34,211,238,0.08)]"
          >
            <UserRound size={56} strokeWidth={1.8} />
          </IconBox>

          <div className="grid min-w-0 gap-2">
            <div className="text-[clamp(1.2rem,1.55vw,1.6rem)] font-black leading-[1.1] text-white">
              {displayName}
            </div>

            <div className="text-[0.9rem] text-[#b0bfd3]">{user.email}</div>

            <div className="flex flex-wrap gap-2.5">
              <Badge tone="info" icon={<ShieldCheck size={14} />}>
                {roleLabel}
              </Badge>

              <Badge
                tone={user.isActive === false ? 'warning' : 'success'}
                icon={<span className="inline-block h-2 w-2 flex-none rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-px w-full self-stretch bg-slate-400/15 lg:h-auto lg:w-px" />

        <div className="grid grid-cols-1 items-center gap-0 pl-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:pl-6">
          <StatCard
            surface={false}
            variant="inline"
            iconClassName="border border-cyanline/15 bg-cyanline/10 text-cyanline shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]"
            icon={<Mail size={24} />}
            label="Số dư ví"
            value={formatCurrency(wallet?.balance || 0)}
          />

          <div className="my-2 h-px w-full justify-self-center bg-slate-400/20 lg:my-0 lg:h-16 lg:w-px" />

          <StatCard
            surface={false}
            variant="inline"
            iconClassName="border border-cyanline/15 bg-cyanline/10 text-cyanline shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]"
            icon={<Mail size={24} />}
            label="Đơn hàng"
            value={`${ordersCount} đơn`}
          />
        </div>
      </div>
    </div>
  );
}
