import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from '../common/useAsyncAction';
import { executeBackgroundFetch } from '../common/useBackgroundFetch';
import { useAdminCrud } from '../common/useAdminCrud';
import { getGames } from '../../services/games.api';
import { createGame, updateGame, deleteGame } from '../../services/admin.api';
import { useGamesStore } from '../../store/games.store';

export function useAdminGames(setError: (message: string | null) => void, execute: AsyncActionExecutor) {
  const { games, loading } = useGamesStore(
    useShallow((state) => ({ games: state.games, loading: state.gamesLoading }))
  );

  async function refresh() {
    const current = useGamesStore.getState();
    await executeBackgroundFetch({
      hasData: current.games.length > 0,
      setLoading: current.setGamesLoading,
      setError,
      fetcher: getGames,
      onSuccess: current.setGames,
    });
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [setError]);

  const crud = useAdminCrud('game', execute, {
    create: createGame,
    update: updateGame,
    remove: deleteGame
  }, refresh);

  return {
    games,
    loading,
    refresh,
    createGame: crud.createItem,
    updateGame: crud.updateItem,
    removeGame: crud.removeItem,
  };
}
