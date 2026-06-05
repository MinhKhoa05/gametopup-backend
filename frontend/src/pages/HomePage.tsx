import { useState } from 'react';
import { ChevronRight, ShieldCheck, WalletCards, Zap } from 'lucide-react';
import { AuthPanel } from '../components/auth/AuthPanel';
import { GameGrid } from '../components/games/GameGrid';
import { HowToTopupSection } from '../components/home/HowToTopupSection';
import { SITE } from '../config/site';
import { useAuthSession } from '../hooks/auth.hooks';
import { useGameCatalog } from '../hooks/games.hooks';
import { ActionCard, Badge, Button, SearchBar } from '../components/ui';
import { Route } from '../lib/routes';
import { classNames, pickImage } from '../lib/ui';
export function HomePage({
  navigate,
}: {
  navigate: (route: Route) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const { games, gamesLoading } = useGameCatalog({ name: 'home' });
  const { authBusy, authForm, authMode, authStatus, handleAuth, handleLogout, setAuthForm, setAuthMode, user } = useAuthSession({
    navigate,
  });
  const featured = games.slice(0, 8);
  const hasLogin = Boolean(user);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8">
      <section
        className="relative mt-5 mb-10 overflow-hidden rounded-3xl border border-white/5 px-4 py-6 sm:rounded-[24px] sm:px-6 sm:py-10 lg:px-10 lg:py-16"
        style={{
          backgroundImage:
            "linear-gradient(100deg, rgba(7, 17, 31, 1) 0%, rgba(7, 17, 31, 0.9) 50%, rgba(7, 17, 31, 0.6) 100%), url('https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1600&q=80')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <Badge variant="accent" className="uppercase tracking-[0.18em]">
            Dịch vụ nạp hộ - Trung gian uy tín
          </Badge>
          <h1 className="mb-6 text-[clamp(2.2rem,9vw,4.2rem)] font-black leading-[0.95] tracking-tight text-white sm:text-6xl">
            Nạp Game Qua Đại Lý
            <br />
            <span className="text-cyan">Tiết Kiệm Chi Phí</span>
          </h1>
          <p className="mb-8 max-w-xl text-[0.95rem] leading-[1.55] text-slate-300 sm:text-lg">
            {SITE.name} là đại lý trung gian cung cấp các gói nạp game với mức chiết khấu cực tốt. An toàn, uy tín và giúp bạn tiết kiệm hơn so với cổng nạp gốc.
          </p>
          <SearchBar
            className="max-w-md"
            inputClassName="py-3 text-lg"
            value={keyword}
            onChange={setKeyword}
            placeholder="Tìm game bạn muốn nạp..."
            ariaLabel="Tìm game"
            onEnter={() => navigate({ name: 'games' })}
          />
        </div>
      </section>

      <section className="my-8 grid grid-cols-1 gap-3 border-y border-white/5 py-4 md:grid-cols-3 md:gap-4 md:py-6">
        <ActionCard
          icon={<Zap size={32} className="text-cyan" />}
          title="Xử Lý Nhanh Chóng"
          description="Hoàn thành trong 5-15 phút"
        />
        <ActionCard
          icon={<ShieldCheck size={32} className="text-cyan" />}
          title="Giao Dịch Đảm Bảo"
          description="Uy tín 100%"
        />
        <ActionCard
          icon={<WalletCards size={32} className="text-cyan" />}
          title="Giá Rẻ Hơn"
          description="Rẻ hơn tới 15% so với web gốc"
        />
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
          <div>
            <h2 className="mb-0 text-2xl font-extrabold text-white">Danh Mục Game</h2>
          </div>
          <Button className="border-none bg-transparent px-0 py-0 text-cyan hover:bg-transparent hover:text-cyan-50" onClick={() => navigate({ name: 'games' })}>
            Xem tất cả <ChevronRight size={16} />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-x-2 gap-y-3 overflow-visible pb-0 sm:grid-cols-4 md:flex md:items-start md:gap-4 md:overflow-x-auto md:pb-3 md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">
          {gamesLoading && games.length === 0
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={`category-skeleton-${index}`} className="flex w-full flex-col items-center justify-start gap-2 text-center text-[0.72rem] font-semibold text-slate-300 md:w-[96px] md:flex-none md:text-sm" aria-hidden="true">
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/10 md:h-[72px] md:w-[72px] md:rounded-3xl" />
                  <div className="h-3.5 w-16 animate-pulse rounded-full bg-white/10" />
                </div>
              ))
            : games.map((game) => (
                <button
                  key={game.id}
                  className="group flex w-full flex-col items-center justify-start gap-2 text-center text-[0.72rem] font-semibold text-slate-300 transition-transform duration-200 md:w-[96px] md:flex-none md:text-sm"
                  onClick={() => navigate({ name: 'games', gameId: game.id })}
                >
                  <img
                    src={pickImage(game)}
                    alt={game.name}
                    className="aspect-square w-full rounded-2xl border border-transparent bg-ink-lighter object-cover transition-all duration-200 group-hover:-translate-y-1 group-hover:border-cyan md:h-[72px] md:w-[72px] md:rounded-3xl"
                    width={72}
                    height={72}
                  />
                  <span className="leading-tight">{game.name}</span>
                </button>
              ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-extrabold text-white">Các Game Phổ Biến</h2>
        <GameGrid
          games={featured}
          loading={gamesLoading && games.length === 0}
          skeletonCount={8}
          onPick={(game) => navigate({ name: 'games', gameId: game.id })}
          renderBadges={(game) => {
            const maxDiscount = 12 + (game.name.length % 10);
            return <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">CK {maxDiscount}%</div>;
          }}
        />
      </section>

      <section className={classNames('mb-16 grid items-start gap-8', hasLogin ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_400px]')}>
        <HowToTopupSection hasLogin={hasLogin} />

        {!hasLogin ? (
          <div className="self-start">
            <AuthPanel
              authMode={authMode}
              form={authForm}
              wallet={null}
              busy={authBusy}
              user={user}
              authStatus={authStatus}
              onSubmit={handleAuth}
              onLogout={handleLogout}
              onChangeAuthForm={setAuthForm}
              onSwitchMode={setAuthMode}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
