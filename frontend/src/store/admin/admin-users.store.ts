import { create } from 'zustand';
import type { User } from '../../types';

/**
 * State người dùng trong trang quản trị.
 */
type AdminUsersStore = {
  users: User[];
  usersLoading: boolean;
  loading: boolean;

  setUsers: (users: User[]) => void;
  setUsersLoading: (usersLoading: boolean) => void;
  setLoading: (loading: boolean) => void;
};

export const useAdminUsersStore = create<AdminUsersStore>((set) => ({
  users: [],
  usersLoading: false,
  loading: false,

  setUsers: (users) => set({ users }),
  setUsersLoading: (usersLoading) => set({ usersLoading, loading: usersLoading }),
  setLoading: (loading) => set({ usersLoading: loading, loading }),
}));
