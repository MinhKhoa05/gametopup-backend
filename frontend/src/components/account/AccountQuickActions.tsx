import {
  ArrowRight,
  Gamepad2,
  LogOut,
  WalletCards,
} from 'lucide-react';

import { IconBox } from '../ui/IconBox';
import { Route } from '../../lib/routes';

type AccountQuickActionsProps = {
  onLogout: () => void;
  navigate: (route: Route) => void;
};

export function AccountQuickActions({
  onLogout,
  navigate,
}: AccountQuickActionsProps) {
  return (
    <section className="gametopup-surface min-h-0">
      <div className="grid gap-3.5">
        <button
          type="button"
          className="gametopup-action-row"
          onClick={() => navigate({ name: 'wallet' })}
        >
          <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
            <WalletCards size={20} />
          </IconBox>

          <span className="gametopup-action-row__copy">
            <strong>Nạp ví</strong>
            <small>Thêm tiền và theo dõi giao dịch</small>
          </span>

          <span className="gametopup-action-row__arrow">
            <ArrowRight size={18} />
          </span>
        </button>

        <button
          type="button"
          className="gametopup-action-row"
          onClick={() => navigate({ name: 'orders' })}
        >
          <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
            <Gamepad2 size={20} />
          </IconBox>

          <span className="gametopup-action-row__copy">
            <strong>Lịch sử đơn</strong>
            <small>Xem lại các đơn đã đặt</small>
          </span>

          <span className="gametopup-action-row__arrow">
            <ArrowRight size={18} />
          </span>
        </button>

        <button
          type="button"
          className="gametopup-action-row"
          onClick={() => navigate({ name: 'wallet' })}
        >
          <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
            <WalletCards size={20} />
          </IconBox>

          <span className="gametopup-action-row__copy">
            <strong>Lịch sử nạp tiền</strong>
            <small>Xem giao dịch và số dư ví</small>
          </span>

          <span className="gametopup-action-row__arrow">
            <ArrowRight size={18} />
          </span>
        </button>

        <button
          type="button"
          className="gametopup-action-row"
          onClick={onLogout}
        >
          <IconBox size="sm" className="bg-red-500/10 text-red-300">
            <LogOut size={20} />
          </IconBox>

          <span className="gametopup-action-row__copy">
            <strong>Đăng xuất</strong>
            <small>Thoát khỏi tài khoản hiện tại</small>
          </span>

          <span className="gametopup-action-row__arrow">
            <ArrowRight size={18} />
          </span>
        </button>
      </div>
    </section>
  );
}