import { create } from 'zustand';
import type { Order } from '../../types';

/**
 * State đơn hàng trong trang quản trị.
 */
type AdminOrdersStore = {
  orders: Order[];
  ordersLoading: boolean;
  loading: boolean;

  setOrders: (orders: Order[]) => void;
  setOrdersLoading: (ordersLoading: boolean) => void;
  setLoading: (loading: boolean) => void;
};

export const useAdminOrdersStore = create<AdminOrdersStore>((set) => ({
  orders: [],
  ordersLoading: false,
  loading: false,

  setOrders: (orders) => set({ orders }),
  setOrdersLoading: (ordersLoading) => set({ ordersLoading, loading: ordersLoading }),
  setLoading: (loading) => set({ ordersLoading: loading, loading }),
}));
