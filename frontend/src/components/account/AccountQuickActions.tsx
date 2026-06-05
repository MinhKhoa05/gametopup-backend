import { Gamepad2, LogOut, WalletCards } from 'lucide-react';
import { Route } from '../../lib/routes';
import { ActionCard, IconBox } from '../ui';

type AccountQuickActionsProps = {
  onLogout: () => void;
  navigate: (route: Route) => void;
};

export function AccountQuickActions({ onLogout, navigate }: AccountQuickActionsProps) {
  return (
    <section className="gt-surface min-h-0">
      <div className="grid gap-3.5">
        <ActionCard
          icon={
            <IconBox size="sm" className="bg-sky-950/80 text-cyan">
              <WalletCards size={20} />
            </IconBox>
          }
          title="Nạp ví"
          description="Nạp thêm tiền vào ví"
          onClick={() => navigate({ name: 'wallet' })}
        />

        <ActionCard
          icon={
            <IconBox size="sm" className="bg-sky-950/80 text-cyan">
              <Gamepad2 size={20} />
            </IconBox>
          }
          title="Lịch sử đơn"
          description="Xem lại các đơn đã đặt"
          onClick={() => navigate({ name: 'orders' })}
        />

        <ActionCard
          icon={
            <IconBox size="sm" className="bg-sky-950/80 text-cyan">
              <WalletCards size={20} />
            </IconBox>
          }
          title="Lịch sử nạp tiền"
          description="Xem giao dịch và số dư ví"
          onClick={() => navigate({ name: 'wallet' })}
        />

        <ActionCard
          icon={
            <IconBox size="sm" className="bg-rose-500/10 text-rose-300">
              <LogOut size={20} />
            </IconBox>
          }
          title="Đăng xuất"
          description="Thoát khỏi tài khoản hiện tại"
          onClick={onLogout}
        />
      </div>
    </section>
  );
}
