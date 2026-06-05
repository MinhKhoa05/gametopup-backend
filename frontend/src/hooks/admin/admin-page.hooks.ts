import { useQueryClient } from '@tanstack/react-query';
import { useRoute } from '../common/route.hooks';
import { useAdminMetrics } from './admin-metrics.hooks';
import { useAdminGamesSection } from './admin-games.hooks';
import { useAdminOrdersSection } from './admin-orders.hooks';
import { useAdminPackagesSection } from './admin-packages.hooks';
import { useAdminUsersSection } from './admin-users.hooks';
import {
  adminOrdersQueryKey,
  adminPackagesQueryKey,
  adminUsersQueryKey,
} from '../../services/admin';
import { GAMES_QUERY_KEY } from '../../services/games';
import type { User } from '../../types';

export function useAdminPage({ user }: { user: User | null }) {
  const { route, navigate } = useRoute();
  const adminRoute = route.name === 'admin' ? route : { name: 'admin' as const, section: 'dashboard' as const };
  const queryClient = useQueryClient();
  const gamesSection = useAdminGamesSection();
  const packagesSection = useAdminPackagesSection();
  const ordersSection = useAdminOrdersSection();
  const usersSection = useAdminUsersSection();
  const metrics = useAdminMetrics({
    games: gamesSection.games,
    orders: ordersSection.orders,
    packages: packagesSection.packages,
    users: usersSection.users,
  });
  const loading = gamesSection.loading || packagesSection.loading || ordersSection.loading || usersSection.loading;
  const busy = gamesSection.busy || packagesSection.busy || ordersSection.busy || usersSection.busy;

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: adminPackagesQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey }),
    ]);
  };

  const section = adminRoute.section ?? 'dashboard';

  return {
    adminRoute,
    busy,
    cancelOrder: ordersSection.cancelOrder,
    completeOrder: ordersSection.completeOrder,
    createGame: gamesSection.createGame,
    createPackage: packagesSection.createPackage,
    games: gamesSection.games,
    loading,
    metrics,
    navigate,
    orders: ordersSection.orders,
    packages: packagesSection.packages,
    pickOrder: ordersSection.pickOrder,
    refreshAll,
    removeGame: gamesSection.removeGame,
    removePackage: packagesSection.removePackage,
    removeUser: usersSection.removeUser,
    section,
    updateGame: gamesSection.updateGame,
    updatePackage: packagesSection.updatePackage,
    updateUser: usersSection.updateUser,
    user,
    users: usersSection.users,
  };
}
