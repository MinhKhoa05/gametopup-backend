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

export function AccountSummary({
  user,
  wallet,
  ordersCount,
}: AccountSummaryProps) {
  const displayName = userDisplayName(user);
  const roleLabel = isAdminUser(user)
    ? 'Quản trị viên'
    : 'Tài khoản cá nhân';

  const statusLabel =
    user.isActive === false
      ? 'Tạm khóa'
      : 'Đang hoạt động';

  return (
    <div className="account-summary-card">
      <div className="account-summary-top">
        <div className="account-profile-strip">
          <IconBox size="lg" className="account-avatar">
            <UserRound size={56} strokeWidth={1.8} />
          </IconBox>

          <div className="grid min-w-0 gap-2">
            <div className="text-[clamp(1.2rem,1.55vw,1.6rem)] font-black leading-[1.1] text-white">
              {displayName}
            </div>

            <div className="text-[0.9rem] text-[#b0bfd3]">
              {user.email}
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Badge tone="info" icon={<ShieldCheck size={14} />}>
                {roleLabel}
              </Badge>

              <Badge
                tone={user.isActive === false ? 'warning' : 'success'}
                icon={
                  <span className="inline-block h-2 w-2 flex-none rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />
                }
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="account-summary-divider" />

        <div className="account-summary-metrics">
          <StatCard
            surface={false}
            variant="inline"
            iconClassName="border border-cyanline/15 bg-cyanline/10 text-cyanline shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]"
            icon={<Mail size={24} />}
            label="Số dư ví"
            value={formatCurrency(wallet?.balance || 0)}
          />

          <div className="account-summary-separator" />

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