import { useState } from 'react';
import { Bell, LayoutDashboard, LogOut, Receipt, UserRound, WalletCards } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { HeaderAccountMenu, type HeaderAccountMenuItem } from './HeaderAccountMenu';
import { SearchBar } from '../ui/SearchBar';
import { userDisplayName } from '../../lib/labels';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import {
  HEADER_ACCOUNT_MENU_ADMIN_ITEMS,
  HEADER_ACCOUNT_MENU_USER_ITEMS,
  HEADER_NAV_ITEMS,
  SITE,
} from '../../config/site';
import { formatCurrency } from '../../lib/format';
import { isAdminUser } from '../../lib/roles';
import type { AuthStatus, User } from '../../types';

export function AppHeader({
  route,
  wallet,
  navigate,
  onLogout,
  authStatus,
  user,
}: {
  route: Route;
  wallet: { balance: number } | null;
  navigate: (route: Route) => void;
  onLogout: () => void;
  authStatus: AuthStatus;
  user: User | null;
}) {
  const [keyword, setKeyword] = useState('');
  const hasLogin = Boolean(user);
  const isAuthPending = authStatus === 'unknown' || authStatus === 'checking';
  const hasKnownSession = hasLogin || !isAuthPending;
  const displayName = userDisplayName(user) || 'Khách';
  const adminUser = isAdminUser(user);
  const baseMenuItems = adminUser ? HEADER_ACCOUNT_MENU_ADMIN_ITEMS : HEADER_ACCOUNT_MENU_USER_ITEMS;
  const menuItems: HeaderAccountMenuItem[] = baseMenuItems.map((item) => {
    const icon =
      item.route?.name === 'account' ? (
        <UserRound size={16} />
      ) : item.route?.name === 'orders' ? (
        <Receipt size={16} />
      ) : item.route?.name === 'wallet' ? (
        <WalletCards size={16} />
      ) : item.route?.name === 'admin' ? (
        <LayoutDashboard size={16} />
      ) : (
        <LogOut size={16} />
      );

    return {
      label: item.label,
      icon,
      className: item.className,
      dividerAfter: item.dividerAfter,
      onClick: () => {
        if (item.className === 'logout') {
          onLogout();
          return;
        }

        if (item.route) navigate(item.route);
      },
    };
  });

  const handleWalletClick = () => {
    navigate(hasLogin ? { name: 'wallet' } : { name: 'account' });
  };

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate({ name: 'games' });
    }
  };

  const shouldShowAuthSkeleton = isAuthPending && !hasKnownSession;
  const visibleNavItems = HEADER_NAV_ITEMS.filter((item) => {
    if (hasLogin) return true;
    return item.route.name !== 'orders' && item.route.name !== 'wallet';
  });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-400/12 bg-[linear-gradient(180deg,rgba(8,15,28,0.98)_0%,rgba(8,15,28,0.92)_100%)] shadow-[0_10px_30px_rgba(2,6,23,0.24)] backdrop-blur-[16px]">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.2)_50%,transparent_100%)] sm:px-6 lg:px-8">
        <div className="header-brand-group flex items-center gap-8">
          <BrandLogo onClick={() => navigate({ name: 'home' })} title={SITE.name} subtitle={SITE.tagline} />

          <nav className="hidden gap-2 md:flex" aria-label="Điều hướng chính">
            {visibleNavItems.map((link) => {
              const isActive = route.name === link.route.name; // Đặt một biến check cho gọn code

              return (
                <button
                  key={link.label}
                  type="button"
                  className={classNames(
                    // 1. CÁC CLASS NỀN TẢNG (Luôn luôn có)
                    'rounded-lg font-semibold transition-all duration-200 outline-none focus-visible:outline-none',
                    'px-4 py-2 text-sm text-slate-300',

                    // 2. HIỆU ỨNG HOVER (Khi di chuột vào các nút KHÔNG active)
                    'hover:-translate-y-0.5 hover:border-sky-300/20 hover:bg-sky-400/10 hover:text-sky-50 hover:shadow-[0_8px_24px_rgba(56,189,248,0.10)]',
                    'focus-visible:-translate-y-0.5 focus-visible:border-sky-300/20 focus-visible:bg-sky-400/10 focus-visible:text-sky-50 focus-visible:shadow-[0_8px_24px_rgba(56,189,248,0.10)]',

                    // 3. TRẠNG THÁI CHƯA CLICK (Default State)
                    !isActive && 'border border-transparent bg-transparent',

                    // 4. TRẠNG THÁI ĐÃ CLICK (Active State) - GIỮ LẠI TRỌN VẸN HIỆU ỨNG SÁNG BỪNG
                    isActive && '-translate-y-0.5 border border-sky-300/25 bg-sky-400/15 text-sky-50 shadow-[0_8px_24px_rgba(56,189,248,0.15)] brightness-110'
                  )}
                  onClick={() => {
                    if ((link.route.name === 'orders' || link.route.name === 'wallet') && !hasLogin) {
                      navigate({ name: 'account' });
                      return;
                    }
                    navigate(link.route);
                  }}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="header-actions flex flex-1 items-center justify-end gap-3">
          <SearchBar
            dense
            className="hidden md:flex w-full max-w-[160px] lg:max-w-[200px] shrink-0"
            value={keyword}
            onChange={setKeyword}
            onEnter={handleSearch}
            placeholder="Tìm game..."
            ariaLabel="Tìm game"
          />

          <HeaderWalletButton hasLogin={hasLogin} wallet={wallet} onClick={handleWalletClick} />
          <HeaderAuthSlot
            hasLogin={hasLogin}
            shouldShowAuthSkeleton={shouldShowAuthSkeleton}
            displayName={displayName}
            adminUser={adminUser}
            menuItems={menuItems}
            onLogout={onLogout}
            onNavigate={navigate}
          />
        </div>
      </div>
    </header>
  );
}

function HeaderWalletButton({
  hasLogin,
  wallet,
  onClick,
}: {
  hasLogin: boolean;
  wallet: { balance: number } | null;
  onClick: () => void;
}) {
  if (!hasLogin) return null;

  return (
    <button
      type="button"
      className="hidden h-11 items-center gap-2 rounded-xl border border-white/10 bg-[rgba(255,255,255,0.025)] pl-2 pr-3.5 text-sm font-black text-slate-100 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-cyanline/35 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_0_18px_rgba(34,211,238,0.12)] sm:inline-flex"
      onClick={onClick}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyanline/15 bg-cyanline/10 text-cyanline">
        <WalletCards size={15} />
      </div>
      <span className="tracking-wide text-white">
        {wallet ? formatCurrency(wallet.balance) : '---'}
      </span>
    </button>
  );
}

function HeaderAuthSlot({
  hasLogin,
  shouldShowAuthSkeleton,
  displayName,
  adminUser,
  menuItems,
  onLogout,
  onNavigate,
}: {
  hasLogin: boolean;
  shouldShowAuthSkeleton: boolean;
  displayName: string;
  adminUser: boolean;
  menuItems: HeaderAccountMenuItem[];
  onLogout: () => void;
  onNavigate: (route: Route) => void;
}) {
  return (
    <div className="header-user-group hidden min-h-11 min-w-[176px] items-center justify-end gap-3 sm:flex">
      {shouldShowAuthSkeleton ? (
        <div className="flex min-h-11 min-w-[176px] items-center gap-3 rounded-xl border border-white/10 bg-ink-lighter px-3 py-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-1">
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="h-2.5 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ) : hasLogin ? (
        <>
          <button
            type="button"
            className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-lighter text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/30 hover:bg-sky-500/10 hover:text-sky-50 hover:shadow-[0_8px_24px_rgba(56,189,248,0.10)] sm:inline-flex"
            title="Thông báo"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <HeaderAccountMenu
            triggerLabel={displayName}
            infoLabel={displayName}
            infoBadge={adminUser ? 'Quản trị viên' : 'Tài khoản cá nhân'}
            items={menuItems}
          />
        </>
      ) : (
        <button
          type="button"
          className="inline-flex min-h-11 min-w-[176px] items-center justify-center rounded-xl bg-gradient-to-r from-sky-300 via-cyanline to-sky-200 px-4 text-sm font-bold text-slate-950 shadow-[0_4px_14px_rgba(56,189,248,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_20px_rgba(56,189,248,0.28)]"
          onClick={() => onNavigate({ name: 'account' })}
        >
          <UserRound size={17} />
          <span className="ml-1 hidden sm:inline">Đăng nhập</span>
        </button>
      )}
    </div>
  );
}
