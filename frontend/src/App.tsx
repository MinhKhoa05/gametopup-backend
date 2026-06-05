import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { EmptyState } from './components/ui';
import { useAuthSession } from './hooks/auth.hooks';
import { useRoute } from './hooks/common/route.hooks';
import { queryClient } from './lib/queryClient';
import { useUserOrders } from './hooks/orders.hooks';
import { isAdminUser } from './lib/roles';
import { Route } from './lib/routes';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/admin/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { WalletPage } from './pages/WalletPage';
import { GameOrderWizard } from './components/game-order/GameOrderWizard';
import { useAuthStore } from './store/auth.store';
import { useGameOrderStore } from './store/game-order.store';
import { AUTH_USER_QUERY_KEY } from './services/auth';
import type { AuthStatus, User } from './types';

export function App() {
  const { route, navigate } = useRoute();
  const auth = useAuthSession();
  const user = auth.user;
  const authStatus = auth.authStatus;
  const userOrders = useUserOrders(auth.isLoggedIn);
  const wallet = userOrders.wallet;
  const isAdminRoute = route.name === 'admin';
  const sessionExpiredAt = useAuthStore((state) => state.sessionExpiredAt);

  useEffect(() => {
    if (!sessionExpiredAt) {
      return;
    }

    queryClient.clear();
    queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
    useAuthStore.getState().setGuest();
    useGameOrderStore.getState().resetWizard();
    navigate({ name: 'auth' });
  }, [navigate, sessionExpiredAt]);

  return (
    <AppLayout
      isAdminRoute={isAdminRoute}
      header={
        <AppHeader
          wallet={wallet}
          onLogout={auth.handleLogout}
          authStatus={authStatus}
          user={user}
        />
      }
      footer={<AppFooter />}
      bottomNav={<BottomNav hasLogin={auth.isLoggedIn} />}
      toast={<Toaster richColors position="top-right" />}
    >
      {route.name === 'home' && (
        <HomePage />
      )}

      {route.name === 'auth' && <AuthPage />}

      {!isAdminRoute && route.name !== 'home' && route.name !== 'auth' && (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {route.name === 'games' && !route.gameId && <GamesPage />}

          {route.name === 'games' && route.gameId && <GameOrderWizard gameId={route.gameId} />}

          {route.name === 'wallet' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'auth' }}>
              <WalletPage />
            </AuthGuard>
          )}

          {route.name === 'orders' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'auth' }}>
              <OrdersPage />
            </AuthGuard>
          )}

          {route.name === 'account' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'auth' }}>
              <AccountPage />
            </AuthGuard>
          )}
        </div>
      )}

      {isAdminRoute && (
        <AuthGuard authStatus={authStatus} user={user} required="admin" fallbackRoute={{ name: 'home' }}>
          <AdminPage onLogout={auth.handleLogout} user={user} />
        </AuthGuard>
      )}
      </AppLayout>
    );
  }

const AUTH_GUARD_EMPTY_STATE_CLASS = 'mx-auto max-w-lg py-16';

function AuthGuard({
  authStatus,
  children,
  fallbackRoute,
  required,
  user,
}: {
  authStatus: AuthStatus;
  children: ReactNode;
  fallbackRoute: Route;
  required: 'authenticated' | 'admin';
  user: User | null;
}) {
  if (authStatus === 'unknown' || authStatus === 'checking') {
    return <AuthGuardSkeleton />;
  }

  if (required === 'admin') {
    const allowed = Boolean(user && isAdminUser(user));
    if (!allowed) {
      return (
        <AccessDeniedNotice
          fallbackRoute={fallbackRoute}
          title="Bạn không có quyền truy cập trang này."
          description="Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục."
          actionLabel="Về trang chủ"
        />
      );
    }
  } else if (!user) {
    return (
      <AccessDeniedNotice
        fallbackRoute={fallbackRoute}
        title="Bạn cần đăng nhập để tiếp tục."
        description="Khu vực này chỉ dành cho tài khoản đã xác thực."
        actionLabel="Đăng nhập"
      />
    );
  }

  return children;
}

function AccessDeniedNotice({
  actionLabel,
  description,
  fallbackRoute,
  title,
}: {
  actionLabel: string;
  description: string;
  fallbackRoute: Route;
  title: string;
}) {
  const { navigate } = useRoute();

  return (
    <EmptyState
      className={AUTH_GUARD_EMPTY_STATE_CLASS}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={() => navigate(fallbackRoute)}
    />
  );
}

function AuthGuardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <div className="rounded-2xl border border-white/6 bg-ink-light p-6">
        <div className="mb-6 h-6 w-48 animate-pulse rounded-full bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
        </div>
        <div className="mt-4 h-12 animate-pulse rounded-xl bg-white/6" />
      </div>
    </div>
  );
}
