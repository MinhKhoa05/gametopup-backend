import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Route } from '../lib/routes';
import { GamePackage, User } from '../types';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { payOrder, placeOrder, getMyOrders } from '../services/orders.api';
import { getWallet } from '../services/wallet.api';
import { getApiMessage } from '../lib/api';
import { useOrdersStore } from '../store/orders.store';
import { useWalletStore } from '../store/wallet.store';
import type { CachedUser, AuthStatus } from '../types';
import { executeBackgroundFetch } from './common/useBackgroundFetch';

export function useUserOrders(
  user: User | null,
  authStatus: AuthStatus,
  cachedUser: CachedUser | null,
  execute: AsyncActionExecutor,
  setError: (message: string | null) => void,
) {
  const ordersState = useOrdersStore(
    useShallow((state) => ({
      orders: state.orders,
    })),
  );

  const refreshUserArea = useCallback(async () => {
    if (!user) return;
    const currentOrders = useOrdersStore.getState();
    const currentWallet = useWalletStore.getState();
    const hasData = currentWallet.wallet !== null || currentOrders.orders.length > 0;

    await executeBackgroundFetch({
      hasData,
      setLoading: (loading) => {
        currentWallet.setWalletLoading(loading);
        currentOrders.setOrdersLoading(loading);
      },
      setError,
      fetcher: () => Promise.allSettled([getWallet(), getMyOrders()]),
      onSuccess: ([walletResult, ordersResult]) => {
        if (walletResult.status === 'fulfilled') {
          currentWallet.setWallet(walletResult.value);
        }
        else if (!hasData) setError(getApiMessage(walletResult.reason));

        if (ordersResult.status === 'fulfilled') currentOrders.setOrders(ordersResult.value);
        else if (!hasData) setError(getApiMessage(ordersResult.reason));
      },
    });
  }, [setError, user]);

  useEffect(() => {
    refreshUserArea().catch(() => undefined);
  }, [refreshUserArea, user?.id]);

  const handlePay = useCallback(async (orderId: number) => {
    await execute(() => payOrder(orderId), {
      successMessage: 'Thanh toán đơn hàng thành công.',
      onSuccess: refreshUserArea,
    });
  }, [execute, refreshUserArea]);

  return {
    handlePay,
    orders: ordersState.orders,
    refreshUserArea,
  };
}

export function useCheckoutOrder({
  navigate,
  refreshUserArea,
  execute,
  selectedPackage,
}: {
  navigate: (route: Route) => void;
  refreshUserArea: () => Promise<void>;
  execute: AsyncActionExecutor;
  selectedPackage: GamePackage | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [gameAccountInfo, setGameAccountInfo] = useState('');
  const total = selectedPackage ? selectedPackage.salePrice * quantity : 0;

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault();
    if (!selectedPackage) return;

    await execute(() => placeOrder(selectedPackage.id, quantity, gameAccountInfo), {
      successMessage: 'Đã tạo đơn. Bạn có thể thanh toán ngay bằng số dư ví.',
      onSuccess: async () => {
        setGameAccountInfo('');
        await refreshUserArea();
        navigate({ name: 'orders' });
      },
    });
  }

  return {
    gameAccountInfo,
    handlePlaceOrder,
    quantity,
    setGameAccountInfo,
    setQuantity,
    total,
  };
}
