import { EmptyState, SearchBar } from '../components/ui';
import { GameGrid } from '../components/games/GameGrid';
import { useGameCatalog } from '../hooks/games.hooks';
import { useRoute } from '../hooks/common/route.hooks';

export function GamesPage() {
  const { route, navigate } = useRoute();
  const catalog = useGameCatalog(route);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-black text-white">Kho Game</h1>
        <SearchBar
          className="max-w-xl"
          value={catalog.query}
          onChange={catalog.setQuery}
          placeholder="TÃ¬m game (VD: Free Fire, LiÃªn QuÃ¢n)..."
          ariaLabel="TÃ¬m game"
        />
      </div>

      <GameGrid
        games={catalog.filteredGames}
        loading={catalog.gamesLoading && catalog.games.length === 0}
        skeletonCount={12}
        onPick={(game) => navigate({ name: 'games', gameId: game.id })}
        renderBadges={(game) => {
          const maxDiscount = 12 + (game.name.length % 10);

          return (
            <>
              <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">
                CK {maxDiscount}%
              </div>
              {!game.isActive ? <div className="rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white">Táº¡m áº©n</div> : null}
            </>
          );
        }}
      />

      {!catalog.gamesLoading && catalog.filteredGames.length === 0 && (
        <EmptyState className="mt-8">KhÃ´ng tÃ¬m tháº¥y game nÃ o phÃ¹ há»£p vá»›i tá»« khÃ³a "{catalog.query}".</EmptyState>
      )}
    </div>
  );
}
