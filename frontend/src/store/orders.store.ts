import { create } from 'zustand';
import type { Order } from '../types';

/**
 * State đơn hàng dùng chung cho toàn bộ ứng dụng.
 */
type OrdersStore = {
  orders: Order[];
  ordersLoading: boolean;

  setOrders: (orders: Order[]) => void;
  setOrdersLoading: (ordersLoading: boolean) => void;
};

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  ordersLoading: false,

  setOrders: (orders) => set({ orders }),
  setOrdersLoading: (ordersLoading) => set({ ordersLoading }),
}));