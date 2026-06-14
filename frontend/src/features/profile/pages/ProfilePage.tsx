import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  LockKeyhole,
  Mail,
  Package2,
  PencilLine,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import type { User } from '@/features/auth/types';
import { formatUserRoleLabel, isAdminUserRole } from '@/features/auth/userRole';
import type { Game } from '@/features/games/types';
import { useGamesQuery } from '@/features/games/server';
import { buildOrderHistoryItems } from '@/features/orders/components/OrderHistorySections';
import type { Order } from '@/features/orders/types';
import { useMyOrdersQuery } from '@/features/orders/server';
import { useUpdateMyProfileMutation } from '@/features/profile/server';
import { useWalletBalanceQuery, useWalletTransactionsQuery } from '@/features/wallet/server';
import { Badge, Button, EmptyState, Field, IconBox, ImageBox, PageHero, TrustSection } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';

const PANEL_CLASS =
  'rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,16,31,0.94),rgba(4,10,22,0.98))] shadow-[0_16px_38px_rgba(2,6,23,0.18)]';

type ProfileStatCard = {
  actionLabel: string;
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: string;
};

type FavoriteGameCard = {
  count: number;
  gameKey: string;
  imageUrl: string;
  name: string;
  packageName: string;
};

export function ProfilePage() {
  const auth = useAuthSession();
  const user = auth.user;

  if (auth.status === 'checking' && !user) {
    return <ProfilePageLoading />;
  }

  if (!user) {
    return <ProfileGuestState />;
  }

  return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: User }) {
  const navigate = useNavigate();
  const walletQuery = useWalletBalanceQuery(true);
  const walletTransactionsQuery = useWalletTransactionsQuery(true);
  const ordersQuery = useMyOrdersQuery();
  const gamesQuery = useGamesQuery();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const [draftName, setDraftName] = useState('');
  const favoritesRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraftName(user.displayName ?? '');
  }, [user.displayName, user.id]);

  const displayName = user.displayName?.trim() || user.email;
  const rawRoleLabel = formatUserRoleLabel(user.role);
  const roleLabel = isAdminUserRole(user.role) ? 'Admin' : rawRoleLabel === 'Member' ? 'Thành viên' : rawRoleLabel;
  const joinedAtLabel = formatJoinedDate(user.createdAt);

  const stats = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    const transactions = walletTransactionsQuery.data ?? [];

    const completedOrders = orders.filter((order) => order.status === 3).length;
    const totalDeposited = transactions.reduce((sum, transaction) => (transaction.type === 1 ? sum + transaction.amount : sum), 0);

    return {
      completedOrders,
      ordersCount: orders.length,
      totalDeposited,
      walletBalance: walletQuery.data ?? 0,
    };
  }, [ordersQuery.data, walletQuery.data, walletTransactionsQuery.data]);

  const overviewCards: ProfileStatCard[] = [
    {
      actionLabel: 'Nạp thêm ngay',
      icon: <WalletCards size={20} />,
      iconClassName: 'border-cyan-400/15 bg-cyan-400/10 text-cyan-50',
      label: 'Số dư ví',
      value: formatCurrency(stats.walletBalance),
    },
    {
      actionLabel: 'Xem lịch sử',
      icon: <ReceiptText size={20} />,
      iconClassName: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300',
      label: 'Tổng đơn hàng',
      value: `${stats.ordersCount} đơn`,
    },
    {
      actionLabel: 'Xem chi tiết',
      icon: <Package2 size={20} />,
      iconClassName: 'border-amber-400/15 bg-amber-400/10 text-amber-300',
      label: 'Đơn hoàn thành',
      value: `${stats.completedOrders} đơn`,
    },
    {
      actionLabel: 'Lịch sử nạp',
      icon: <Sparkles size={20} />,
      iconClassName: 'border-violet-400/15 bg-violet-400/10 text-violet-200',
      label: 'Tổng đã nạp',
      value: formatCurrency(stats.totalDeposited),
    },
  ];

  const favoriteGames = useMemo(() => buildFavoriteGames(ordersQuery.data ?? [], gamesQuery.data ?? []), [gamesQuery.data, ordersQuery.data]);
  const isLoading =
    (walletQuery.isPending && walletQuery.data == null) ||
    (walletTransactionsQuery.isPending && walletTransactionsQuery.data == null) ||
    (ordersQuery.isPending && ordersQuery.data == null) ||
    (gamesQuery.isPending && gamesQuery.data == null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({
      userId: user.id,
      displayName: draftName.trim(),
    });
  }

  return (
    <div className="relative isolate overflow-hidden">
      <ProfileBackground />

      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <ProfileHero />

          {isLoading ? <ProfileStatsSkeleton /> : <ProfileStatsGrid cards={overviewCards} />}

          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)] xl:items-stretch">
            <ProfileSummaryCard displayName={displayName} joinedAtLabel={joinedAtLabel} roleLabel={roleLabel} user={user} />
            <ProfileShortcutsCard
              shortcuts={[
                { title: 'Nạp ví', description: 'Nạp tiền vào ví để mua game', icon: <WalletCards size={20} />, onClick: () => navigate(routes.wallet()) },
                { title: 'Lịch sử đơn', description: 'Xem lại các đơn đã đặt', icon: <ReceiptText size={20} />, onClick: () => navigate(routes.orders()) },
                { title: 'Lịch sử ví', description: 'Theo dõi các giao dịch nạp và mua', icon: <Sparkles size={20} />, onClick: () => navigate(routes.wallet()) },
                { title: 'Kho game', description: 'Khám phá và nạp game yêu thích', icon: <Gamepad2 size={20} />, onClick: () => navigate(routes.games()) },
              ]}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] xl:items-stretch">
            <ProfileEditCard
              busy={updateProfileMutation.isPending}
              canSave={draftName.trim().length > 0 && draftName.trim() !== (user.displayName ?? '').trim()}
              draftName={draftName}
              email={user.email}
              errorMessage={updateProfileMutation.error instanceof Error ? updateProfileMutation.error.message : null}
              onDraftNameChange={setDraftName}
              onSubmit={handleSubmit}
            />

            <PasswordCard />
          </section>

          <FavoriteGamesSection
            favorites={favoriteGames}
            loading={gamesQuery.isPending || ordersQuery.isPending}
            onBrowse={() => navigate(routes.games())}
            railRef={favoritesRailRef}
          />

          <TrustSection />
        </div>
      </AppPageContainer>
    </div>
  );
}

function ProfileHero() {
  return (
    <PageHero
      title="Tài khoản của tôi"
      description="Quản lý hồ sơ, ví và các lối tắt tài khoản của bạn."
      icon={
        <IconBox size="lg" className="h-[68px] w-[68px] rounded-[20px] border-cyan/18 bg-cyan/10 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]">
          <UserRound size={36} strokeWidth={1.8} />
        </IconBox>
      }
      illustration={
        <img
          src="/assets/profile-illustration.png"
          alt="Minh họa hồ sơ GameTopUp"
          className="relative z-10 w-full max-w-[320px] -translate-y-1 object-contain object-center drop-shadow-[0_0_30px_rgba(34,211,238,0.14)] lg:max-w-[300px]"
          loading="eager"
          decoding="async"
        />
      }
    />
  );
}

function ProfileStatsGrid({ cards }: { cards: ProfileStatCard[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="group grid min-h-[142px] gap-4 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.72)] p-4 text-left shadow-[0_12px_28px_rgba(2,6,23,0.14)] transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] hover:shadow-[0_18px_36px_rgba(2,6,23,0.18)]"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <span className={classNames('grid size-11 place-items-center rounded-[16px] border', card.iconClassName)}>{card.icon}</span>
            <div className="grid gap-1">
              <span className="text-[0.92rem] font-semibold text-slate-400">{card.label}</span>
              <strong
                className={classNames(
                  'text-[clamp(1.28rem,1.7vw,1.78rem)] font-black tracking-[-0.05em] tabular-nums',
                  card.iconClassName.includes('emerald')
                    ? 'text-emerald-300'
                    : card.iconClassName.includes('amber')
                      ? 'text-amber-300'
                      : card.iconClassName.includes('violet')
                        ? 'text-violet-300'
                        : 'text-cyan-300',
                )}
              >
                {card.value}
              </strong>
            </div>
          </div>

          <div className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-cyan-200 transition-colors group-hover:text-cyan-50">
            <span>{card.actionLabel}</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </article>
      ))}
    </section>
  );
}

function ProfileSummaryCard({
  displayName,
  joinedAtLabel,
  roleLabel,
  user,
}: {
  displayName: string;
  joinedAtLabel: string;
  roleLabel: string;
  user: User;
}) {
  const initials = getInitials(user.displayName ?? user.email, user.email);

  return (
    <section className={PANEL_CLASS}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <h2 className="m-0 text-[1.5rem] font-black tracking-[-0.03em] text-white sm:text-[1.7rem]">Thông tin tài khoản</h2>
        </div>
        <Button type="button" variant="secondary" className="rounded-[16px] px-4">
          <PencilLine size={16} />
          Chỉnh sửa avatar
        </Button>
      </div>

      <div className="relative grid gap-5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 lg:min-h-[258px] lg:pb-16">
        <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
          <div className="mx-auto mt-1 grid size-[120px] place-items-center rounded-full border border-cyan/25 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.24),rgba(34,211,238,0.08)_52%,rgba(7,16,31,0.9)_72%)] text-[2.1rem] font-black tracking-[-0.06em] text-white shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_0_34px_rgba(34,211,238,0.12)]">
            {user.avatarUrl ? <ImageBox src={user.avatarUrl} alt={displayName} className="size-full rounded-full object-cover" /> : initials}
          </div>

          <div className="flex min-h-full min-w-0 flex-col pt-1 lg:pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="m-0 text-[clamp(1.7rem,2.35vw,2.55rem)] font-black leading-[0.98] tracking-[-0.06em] text-white">{displayName}</h3>
              <Badge variant="accent" icon={<BadgeCheck size={14} />} className="rounded-full">
                {roleLabel}
              </Badge>
            </div>

            <p className="mt-3 mb-2 text-[0.98rem] text-slate-300">GameTopUpVN</p>

            <div className="grid gap-2 text-[0.96rem] text-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="grid size-4 place-items-center rounded-full bg-cyan/10 text-cyan shadow-[0_0_0_1px_rgba(34,211,238,0.2)]">
                  <Mail size={12} />
                </span>
                <span className="truncate">{user.email}</span>
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[0.95rem] text-slate-200 lg:absolute lg:left-6 lg:bottom-6">
          <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.4)]" />
          <span>Thành viên từ {joinedAtLabel}</span>
        </div>
      </div>
    </section>
  );
}

function ProfileShortcutsCard({
  shortcuts,
}: {
  shortcuts: Array<{ description: string; icon: ReactNode; title: string; onClick: () => void }>;
}) {
  return (
    <section className={PANEL_CLASS}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <h2 className="m-0 text-[1.5rem] font-black tracking-[-0.03em] text-white sm:text-[1.7rem]">Lối tắt tài khoản</h2>
        </div>
      </div>

      <div className="grid gap-3 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:grid-cols-2">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.title}
            type="button"
            className="group grid min-h-[138px] gap-4 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.035)] p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(34,211,238,0.08)] hover:shadow-[0_16px_30px_rgba(2,6,23,0.18)]"
            onClick={shortcut.onClick}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-[16px] border border-cyan/15 bg-cyan/10 text-cyan-50">{shortcut.icon}</span>
              <ArrowRight size={18} className="mt-1 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-200" />
            </div>
            <div className="grid gap-1">
              <strong className="text-[0.98rem] font-black text-white">{shortcut.title}</strong>
              <span className="max-w-[24ch] text-[0.9rem] leading-6 text-slate-400">{shortcut.description}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ProfileEditCard({
  busy,
  canSave,
  draftName,
  email,
  errorMessage,
  onDraftNameChange,
  onSubmit,
}: {
  busy: boolean;
  canSave: boolean;
  draftName: string;
  email: string;
  errorMessage: string | null;
  onDraftNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className={PANEL_CLASS}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <h2 className="m-0 text-[1.5rem] font-black tracking-[-0.03em] text-white sm:text-[1.7rem]">Cập nhật hồ sơ</h2>
        </div>
      </div>

      <form className="grid gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6" onSubmit={onSubmit}>
        <Field
          label="Tên hiển thị"
          value={draftName}
          onChange={(event) => onDraftNameChange(event.target.value)}
          placeholder="Nhập tên hiển thị"
          wrapperClassName="mb-0"
        />

        <Field
          label="Email"
          value={email}
          readOnly
          placeholder={email}
          wrapperClassName="mb-0"
          trailing={<ShieldCheck size={16} className="text-slate-500" />}
        />

        {errorMessage ? <div className="rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{errorMessage}</div> : null}

        <Button type="submit" variant="primary" disabled={!canSave || busy} className="justify-center rounded-[18px] px-5">
          <PencilLine size={16} />
          {busy ? 'Đang cập nhật...' : 'Cập nhật hồ sơ'}
        </Button>
      </form>
    </section>
  );
}

function PasswordCard() {
  return (
    <section className={PANEL_CLASS}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <h2 className="m-0 text-[1.5rem] font-black tracking-[-0.03em] text-white sm:text-[1.7rem]">Mật khẩu</h2>
        </div>
      </div>

      <div className="grid gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div className="grid gap-3 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[16px] border border-cyan/15 bg-cyan/10 text-cyan-50">
              <LockKeyhole size={18} />
            </span>
            <div className="grid gap-1">
              <strong className="text-sm font-black text-white">Mật khẩu</strong>
              <span className="font-mono text-base tracking-[0.24em] text-slate-300">••••••••••••</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 rounded-[16px] border border-white/10 bg-[rgba(7,16,31,0.65)] px-4 py-3">
            <Button type="button" variant="secondary" className="rounded-[16px] px-4" disabled>
              Đổi mật khẩu
            </Button>
          </div>

          <div className="flex items-start gap-2 text-sm leading-6 text-slate-400">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-slate-500" />
            <span>Bạn nên sử dụng mật khẩu mạnh và không chia sẻ với người khác để bảo vệ tài khoản của bạn.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FavoriteGamesSection({
  favorites,
  loading,
  onBrowse,
  railRef,
}: {
  favorites: FavoriteGameCard[];
  loading: boolean;
  onBrowse: () => void;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className={PANEL_CLASS}>
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <h2 className="m-0 text-[1.5rem] font-black tracking-[-0.03em] text-white sm:text-[1.7rem]">Game yêu thích</h2>
        </div>

        <Button type="button" variant="secondary" className="hidden rounded-[16px] px-4 sm:inline-flex" onClick={onBrowse}>
          Xem tất cả
          <ChevronRight size={16} />
        </Button>
      </div>

      <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {loading ? (
          <FavoriteGamesSkeleton />
        ) : favorites.length ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 z-10 flex items-center">
              <RailButton ariaLabel="Xem game trước" onClick={() => scrollRail(railRef.current, -1)}>
                <ChevronLeft size={18} />
              </RailButton>
            </div>
            <div className="absolute inset-y-0 right-0 z-10 flex items-center">
              <RailButton ariaLabel="Xem game sau" onClick={() => scrollRail(railRef.current, 1)}>
                <ChevronRight size={18} />
              </RailButton>
            </div>

            <div
              ref={railRef}
              className="grid auto-cols-[minmax(210px,1fr)] grid-flow-col gap-3 overflow-x-auto px-11 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[minmax(220px,1fr)] lg:auto-cols-[minmax(228px,1fr)]"
            >
              {favorites.map((game) => (
                <article
                  key={game.gameKey}
                  className="group grid gap-3 rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.035)] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(34,211,238,0.07)] hover:shadow-[0_16px_30px_rgba(2,6,23,0.18)]"
                >
                  <div className="relative aspect-[1.35/1] overflow-hidden rounded-[18px] border border-white/10 bg-slate-950">
                    <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.78))]" />
                  </div>

                  <div className="grid gap-1">
                    <strong className="truncate text-sm font-bold text-white">{game.name}</strong>
                    <span className="text-xs text-slate-400">{game.packageName}</span>
                    <span className="text-xs font-medium text-cyan-200">Đã nạp {game.count} lần</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            variant="compact"
            title="Chưa có game yêu thích"
            description="Khi bạn có đơn hàng, các game được nạp nhiều sẽ hiển thị tại đây."
            actionLabel="Khám phá kho game"
            onAction={onBrowse}
          />
        )}
      </div>
    </section>
  );
}

function FavoriteGamesSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Đang tải game yêu thích">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid gap-3 rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.035)] p-3">
          <div className="aspect-[1.35/1] animate-pulse rounded-[18px] bg-white/6" />
          <div className="grid gap-2">
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileStatsSkeleton() {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Đang tải số liệu tài khoản">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="min-h-[142px] rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.72)] p-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <div className="size-11 animate-pulse rounded-[16px] bg-white/6" />
            <div className="grid gap-2">
              <div className="h-4 w-24 animate-pulse rounded-full bg-white/6" />
              <div className="h-7 w-32 animate-pulse rounded-full bg-white/6" />
            </div>
          </div>
          <div className="mt-6 h-4 w-28 animate-pulse rounded-full bg-white/6" />
        </div>
      ))}
    </section>
  );
}

function ProfilePageLoading() {
  return (
    <AppPageContainer className="py-5 sm:py-7 lg:py-8" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <div className="grid gap-6 lg:gap-7">
        <div className="h-[380px] animate-pulse rounded-[30px] border border-white/10 bg-white/[0.03]" />
        <ProfileStatsSkeleton />
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-[420px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
          <div className="h-[420px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
        </div>
        <div className="h-[320px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
        <div className="h-[220px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
      </div>
    </AppPageContainer>
  );
}

function ProfileGuestState() {
  const navigate = useNavigate();

  return (
    <EmptyState
      className="mx-auto mt-12 max-w-lg"
      title="Không có phiên đăng nhập"
      description="Vui lòng đăng nhập lại để xem tài khoản của bạn."
      actionLabel="Đăng nhập"
      onAction={() => navigate(routes.auth())}
    />
  );
}

function ProfileBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.16),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] [background-size:72px_72px]" />
    </>
  );
}

function buildFavoriteGames(orders: Order[], games: Game[]) {
  const grouped = new Map<string, FavoriteGameCard>();
  const historyItems = buildOrderHistoryItems(orders, games);

  for (const item of historyItems) {
    const existing = grouped.get(item.gameKey);
    if (!existing) {
      grouped.set(item.gameKey, {
        count: 1,
        gameKey: item.gameKey,
        imageUrl: item.gameThumbnailSrc,
        name: item.gameName,
        packageName: item.packageName,
      });
      continue;
    }

    existing.count += 1;
    existing.packageName = item.packageName;
    existing.imageUrl = item.gameThumbnailSrc;
  }

  return Array.from(grouped.values())
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 5);
}

function getInitials(displayName: string, fallbackEmail: string) {
  const base = displayName.trim() || fallbackEmail.trim();
  if (!base) {
    return 'GT';
  }

  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  const prefix = base.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 2);
  if (prefix.length >= 2) {
    return prefix.toUpperCase();
  }

  return base.slice(0, 2).toUpperCase();
}

function formatJoinedDate(value?: string) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function scrollRail(element: HTMLDivElement | null, direction: -1 | 1) {
  if (!element) {
    return;
  }

  const width = Math.max(280, Math.round(element.clientWidth * 0.8));
  element.scrollBy({ behavior: 'smooth', left: direction * width });
}

function BadgeDot() {
  return <span className="size-2 rounded-full bg-current" />;
}

function RailButton({
  ariaLabel,
  children,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(7,16,31,0.82)] text-slate-200 shadow-[0_10px_22px_rgba(2,6,23,0.18)] transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.96)] hover:text-cyan-50"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
