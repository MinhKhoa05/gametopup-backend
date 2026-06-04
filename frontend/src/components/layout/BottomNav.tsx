import { ReactNode } from 'react';
import { Gamepad2, Home, PackageCheck, UserRound, WalletCards } from 'lucide-react';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import { BOTTOM_NAV_ITEMS } from '../../config/site';

const bottomNavIcons: Record<Route['name'], ReactNode> = {
  home: <Home size={20} />,
  games: <Gamepad2 size={20} />,
  wallet: <WalletCards size={20} />,
  orders: <PackageCheck size={20} />,
  account: <UserRound size={20} />,
  admin: <UserRound size={20} />,
};

export function BottomNav({
  route,
  navigate,
  hasLogin,
}: {
  route: Route;
  navigate: (route: Route) => void;
  hasLogin: boolean;
}) {
  const visibleItems = BOTTOM_NAV_ITEMS.filter((tab) => {
    if (hasLogin) return true;
    return tab.route.name !== 'orders' && tab.route.name !== 'wallet';
  });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-white/5 bg-[linear-gradient(180deg,rgba(9,19,35,0.72),rgba(7,17,31,0.96))] px-0 pb-[env(safe-area-inset-bottom,10px)] pt-2.5 backdrop-blur-[14px] md:hidden">
      {visibleItems.map((tab) => (
        <button
          key={tab.route.name}
          type="button"
          aria-current={route.name === tab.route.name ? 'page' : undefined}
          className={classNames(
            'flex min-w-0 flex-col items-center gap-1 rounded-none border-0 bg-transparent px-[10px] pb-1.5 pt-1.5 text-[0.72rem] font-semibold text-slate-500 transition-[color,transform] duration-200',
            route.name === tab.route.name ? 'text-slate-100' : 'hover:text-slate-300',
          )}
          onClick={() => navigate(tab.route)}
        >
          <span
            className={classNames(
              'grid h-10 w-10 place-items-center rounded-full text-inherit transition-[transform,background-color,box-shadow,color,filter] duration-200',
              route.name === tab.route.name
                ? 'translate-y-[-1px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.45),rgba(34,211,238,0.96))] text-[#04111c] shadow-[0_0_0_8px_rgba(34,211,238,0.08),0_0_28px_rgba(34,211,238,0.34)]'
                : '',
            )}
          >
            {bottomNavIcons[tab.route.name]}
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
