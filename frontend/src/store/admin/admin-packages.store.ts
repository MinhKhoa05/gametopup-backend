import { create } from 'zustand';
import type { AdminGamePackage } from '../../types';

/**
 * State gói nạp theo game trong trang quản trị.
 */
type AdminPackagesStore = {
  packages: AdminGamePackage[];
  loading: boolean;
  packagesByGame: Record<number, AdminGamePackage[]>;
  loadingByGame: Record<number, boolean>;

  setPackages: (packages: AdminGamePackage[]) => void;
  setLoading: (loading: boolean) => void;
  setPackagesForGame: (gameId: number, packages: AdminGamePackage[]) => void;
  setLoadingForGame: (gameId: number, loading: boolean) => void;
};

export const useAdminPackagesStore = create<AdminPackagesStore>((set) => ({
  packages: [],
  loading: false,
  packagesByGame: {},
  loadingByGame: {},

  setPackages: (packages) =>
    set({
      packages,
      loading: false,
    }),
  setLoading: (loading) => set({ loading }),
  setPackagesForGame: (gameId, packages) =>
    set((state) => ({
      packagesByGame: { ...state.packagesByGame, [gameId]: packages },
      loadingByGame: { ...state.loadingByGame, [gameId]: false },
    })),

  setLoadingForGame: (gameId, loading) =>
    set((state) => ({
      loadingByGame: { ...state.loadingByGame, [gameId]: loading },
    })),
}));
