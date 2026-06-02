import { useState } from 'react';
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Mail,
  Receipt,
  Search,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { HeaderAccountMenu, type HeaderAccountMenuItem } from './HeaderAccountMenu';
import { userDisplayName } from '../../lib/labels';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import { HEADER_NAV_ITEMS, SITE } from '../../config/site';
import { User, WalletInfo } from '../../types';
import { formatCurrency } from '../../lib/format';
import { isAdminUser } from '../../lib/roles';

export function AppHeader({
  route,
  user,
  wallet,
  navigate,
  onLogout,
}: {
  route: Route;
  user: User | null;
  wallet: WalletInfo | null;
  navigate: (route: Route) => void;
  onLogout: () => void;
}) {
  const [keyword, setKeyword] = useState('');

  const handleWalletClick = () => {
    navigate(user ? { name: 'wallet' } : { name: 'account' });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keyword.trim()) {
      navigate({ name: 'games' });
    }
  };

  const displayName = userDisplayName(user);
  const adminUser = isAdminUser(user);
  const menuItems: HeaderAccountMenuItem[] = [
    {
      label: 'Hồ sơ',
      icon: <UserRound size={16} />,
      onClick: () => navigate({ name: 'account' }),
    },
    {
      label: 'Lịch sử đơn',
      icon: <Receipt size={16} />,
      onClick: () => navigate({ name: 'orders' }),
    },
    {
      label: 'Lịch sử ví',
      icon: <WalletCards size={16} />,
      onClick: () => navigate({ name: 'wallet' }),
    },
  ];

  if (adminUser) {
    menuItems[2].dividerAfter = true;
    menuItems.push({
      label: 'Trang quản trị',
      icon: <LayoutDashboard size={16} />,
      onClick: () => navigate({ name: 'admin' }),
      dividerAfter: true,
    });
    menuItems.push({
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      className: 'logout',
      onClick: onLogout,
    });
  } else {
    menuItems[2].dividerAfter = true;
    menuItems.push({
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      className: 'logout',
      onClick: onLogout,
    });
  }

  return (
    <header className="site-header">
      <div className="header-shell mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="header-brand-group flex items-center gap-8">
          <BrandLogo onClick={() => navigate({ name: 'home' })} title={SITE.name} subtitle={SITE.tagline} />

          <nav className="desktop-nav hidden md:flex" aria-label="Điều hướng chính">
            {HEADER_NAV_ITEMS.map((link) => (
              <button
                key={link.label}
                type="button"
                className={classNames(route.name === link.route.name && 'active')}
                onClick={() => {
                  if (link.route.name === 'orders' && !user) {
                    navigate({ name: 'account' });
                    return;
                  }

                  navigate(link.route);
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-actions flex flex-1 items-center justify-end gap-3">
          <label className="header-search hidden max-w-[260px] flex-1 items-center gap-2 md:flex" aria-label="Tìm game">
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Tìm game..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
          </label>

          <button type="button" className="header-wallet btn-outline hidden rounded-xl sm:inline-flex" onClick={handleWalletClick}>
            <Mail size={18} />
            <span className="text-sm font-bold">{user ? `Ví: ${formatCurrency(wallet?.balance || 0)}` : 'Nạp ví'}</span>
          </button>

          {user ? (
            <div className="header-user-group flex items-center gap-3">
              <button type="button" className="icon-button hidden relative sm:inline-flex" title="Thông báo">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              <HeaderAccountMenu
                triggerLabel={displayName}
                infoLabel={displayName}
                infoBadge={isAdminUser(user) ? 'Quản trị viên' : 'Tài khoản cá nhân'}
                items={menuItems}
              />
            </div>
          ) : (
            <button type="button" className="btn-primary rounded-xl" onClick={() => navigate({ name: 'account' })}>
              <UserRound size={17} />
              <span className="ml-1 hidden text-sm sm:inline">Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
