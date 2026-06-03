import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GamePackage } from '../types';

const GAME_PACKAGES_CACHE_KEY = 'gametopup-game-packages-cache';

/**
 * State gói nạp theo từng game.
 */
type GamePackagesStore = {
  packagesByGame: Record<number, GamePackage[]>;
  loadingByGame: Record<number, boolean>;

  setPackagesForGame: (gameId: number, packages: GamePackage[]) => void;
  setLoadingForGame: (gameId: number, loading: boolean) => void;
  clearPackagesForGame: (gameId: number) => void;
};

export const useGamePackagesStore = create<GamePackagesStore>()(
  persist(
    (set) => ({
      packagesByGame: {},
      loadingByGame: {},

      setPackagesForGame: (gameId, packages) =>
        set((state) => ({
          packagesByGame: { ...state.packagesByGame, [gameId]: packages },
          loadingByGame: { ...state.loadingByGame, [gameId]: false },
        })),

      setLoadingForGame: (gameId, loading) =>
        set((state) => ({
          loadingByGame: { ...state.loadingByGame, [gameId]: loading },
        })),

      clearPackagesForGame: (gameId) =>
        set((state) => {
          const packagesByGame = { ...state.packagesByGame };
          const loadingByGame = { ...state.loadingByGame };

          delete packagesByGame[gameId];
          delete loadingByGame[gameId];

          return { packagesByGame, loadingByGame };
        }),
    }),
    {
      name: GAME_PACKAGES_CACHE_KEY,
      partialize: (state) => ({
        packagesByGame: state.packagesByGame,
      }),
    }
  )
);