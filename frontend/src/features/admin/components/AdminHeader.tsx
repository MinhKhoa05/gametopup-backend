import { Home, LogOut, RotateCcw, UserRound } from 'lucide-react';
import { BrandLogo } from '../../../components/layout/BrandLogo';
import { HeaderAccountMenu } from '../../../components/layout/HeaderAccountMenu';
import { userDisplayName } from '../../../lib/labels';
import { Route } from '../../../lib/routes';
import type { User } from '../../../types';

export function AdminHeader({
  loading,
  navigate,
  onLogout,
  onRefresh,
  route,
  user,
}: {
  loading: boolean;
  navigate: (route: Route) => void;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
  route: Extract<Route, { name: 'admin' }>;
  user: User | null;
}) {
  const subtitleLabel =
    route.section === 'games' ? 'Quản lý game' : route.section === 'packages' ? 'Quản lý gói nạp' : 'Tổng quan';
  const displayName = userDisplayName(user);

  return (
    <header className="admin-header">
      <div className="admin-header-shell mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="admin-header-brand">
          <BrandLogo onClick={() => navigate({ name: 'home' })} title="GameTopUp Admin" subtitle={subtitleLabel} />
        </div>

        <div className="admin-header-actions">
          <button type="button" className="admin-header-action" onClick={onRefresh} disabled={loading}>
            <RotateCcw size={16} className={loading ? 'animate-spin' : undefined} />
            Làm mới
          </button>

          <HeaderAccountMenu
            triggerLabel={displayName}
            infoLabel={displayName}
            infoBadge="Quản trị viên"
            items={[
              {
                label: 'Hồ sơ',
                icon: <UserRound size={16} />,
                onClick: () => navigate({ name: 'account' }),
              },
              {
                label: 'Về trang chủ',
                icon: <Home size={16} />,
                onClick: () => navigate({ name: 'home' }),
                dividerAfter: true,
              },
              {
                label: 'Đăng xuất',
                icon: <LogOut size={16} />,
                className: 'logout',
                onClick: onLogout,
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
