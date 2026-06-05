import { FormEvent, useMemo, useState } from 'react';
import type { Game } from '../../types';
import { filterByQuery } from '../../lib/search';
import { useGamesQuery } from '../../services/games';
import { useAdminGameMutations } from '../../services/admin';

export function useAdminGamesSection() {
  const gamesQuery = useGamesQuery();
  const gameMutations = useAdminGameMutations();

  const games = gamesQuery.data ?? [];
  const loading = gamesQuery.isPending && !gamesQuery.data;
  const busy = [gameMutations.create.isPending, gameMutations.update.isPending, gameMutations.remove.isPending].some(Boolean);

  return {
    busy,
    createGame: async (payload: Parameters<typeof gameMutations.create.mutateAsync>[0]) => {
      await gameMutations.create.mutateAsync(payload);
    },
    games,
    loading,
    removeGame: async (id: number) => {
      await gameMutations.remove.mutateAsync({ id });
    },
    updateGame: async (payload: { id: number; name: string; imageUrl: string; isActive: boolean }) => {
      await gameMutations.update.mutateAsync({
        id: payload.id,
        payload: {
          name: payload.name,
          imageUrl: payload.imageUrl,
          isActive: payload.isActive,
        },
      });
    },
  };
}

const emptyGameForm = {
  imageUrl: '',
  isActive: true,
  name: '',
};

export function useAdminGamesPanel({
  games,
  onCreateGame,
  onDeleteGame,
  onUpdateGame,
}: {
  games: Game[];
  onCreateGame: (payload: { name: string; imageUrl: string; isActive: boolean }) => Promise<void>;
  onDeleteGame: (id: number) => Promise<void>;
  onUpdateGame: (payload: { id: number; name: string; imageUrl: string; isActive: boolean }) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyGameForm);
  const [query, setQuery] = useState('');
  const filteredGames = useMemo(() => filterByQuery(games, query, (game) => game.name), [games, query]);

  function startEdit(game: Game) {
    setEditing(game);
    setForm({ imageUrl: game.imageUrl ?? '', isActive: game.isActive, name: game.name });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyGameForm);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, name: form.name.trim(), imageUrl: form.imageUrl.trim() };
    await (editing ? onUpdateGame({ id: editing.id, ...payload }) : onCreateGame(payload));
    resetForm();
  }

  async function remove(game: Game) {
    if (!window.confirm(`Xóa game "${game.name}"?`)) return;
    await onDeleteGame(game.id);
  }

  return {
    editing,
    filteredGames,
    form,
    query,
    remove,
    resetForm,
    setForm,
    setQuery,
    startEdit,
    submit,
  };
}
