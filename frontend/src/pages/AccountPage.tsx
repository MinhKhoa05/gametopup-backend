import { AccountProfileForm } from '../components/account/AccountProfileForm';
import { AccountQuickActions } from '../components/account/AccountQuickActions';
import { AccountSummary } from '../components/account/AccountSummary';
import { useAuthSession } from '../hooks/auth.hooks';
import { useOrdersQuery } from '../services/orders';
import { useProfileEditor } from '../hooks/user.hooks';
import { useWalletQuery } from '../services/wallet';
import type { User } from '../types';

export function AccountPage() {
  const { authStatus, handleLogout, user } = useAuthSession();

  if (authStatus === 'checking' && !user) {
    return <AccountPageLoading />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-3.5">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <h1 className="m-0 text-[clamp(1.9rem,2.7vw,2.75rem)] font-black leading-none text-white">Tài khoản của tôi</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-slate-400">
            Quản lý thông tin tài khoản và theo dõi nhanh các hoạt động của bạn.
          </p>
        </div>
      </header>

      <AccountProfileSection user={user} onLogout={handleLogout} />
    </div>
  );
}

function AccountProfileSection({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const profileEditor = useProfileEditor({ user });
  const walletQuery = useWalletQuery(true);
  const ordersQuery = useOrdersQuery(true);
  const isLoading = (walletQuery.isPending && !walletQuery.data) || (ordersQuery.isPending && !ordersQuery.data);

  return (
    <section className="gt-surface-ink grid gap-4 overflow-hidden rounded-2xl p-0">
      {isLoading ? (
        <div className="grid gap-0 px-4 pt-5 pb-6 md:p-5 lg:px-6 lg:pt-5 lg:pb-6">
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_1px_minmax(0,1fr)] lg:gap-0">
            <div className="grid grid-cols-1 items-center gap-4 pr-0 md:grid-cols-[auto_minmax(0,1fr)] md:justify-items-start lg:pr-6">
              <div className="grid h-24 w-24 place-items-center rounded-full border border-cyan/25 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.24),transparent_55%),rgba(34,211,238,0.1)] shadow-[inset_0_0_28px_rgba(34,211,238,0.08)]">
                <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="grid min-w-0 gap-2">
                <div className="h-7 w-full max-w-56 animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-full max-w-72 animate-pulse rounded-full bg-white/6" />
                <div className="flex flex-wrap gap-2.5">
                  <div className="h-6 w-32 animate-pulse rounded-full bg-white/8" />
                  <div className="h-6 w-28 animate-pulse rounded-full bg-white/8" />
                </div>
                <div className="text-sm text-slate-400">Đang tải tài khoản...</div>
              </div>
            </div>

            <div className="h-px w-full self-stretch bg-slate-400/15 lg:h-auto lg:w-px" />

            <div className="grid grid-cols-1 items-center gap-0 pl-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:pl-6">
              <div className="h-24 w-full animate-pulse rounded-2xl bg-white/6 md:min-w-60" />
              <div className="my-2 h-px w-full justify-self-center bg-slate-400/20 lg:my-0 lg:h-16 lg:w-px" />
              <div className="h-24 w-full animate-pulse rounded-2xl bg-white/6 md:min-w-60" />
            </div>
          </div>
        </div>
      ) : (
        <AccountSummary
          user={user}
          wallet={walletQuery.data ?? null}
          ordersCount={ordersQuery.data?.length ?? 0}
        />
      )}

      <div className="grid grid-cols-1 items-stretch gap-4 px-4 pb-4 md:px-5 md:pb-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:px-6 lg:pb-6">
        <AccountQuickActions onLogout={onLogout} />

        <AccountProfileForm
          email={user.email}
          draftName={profileEditor.draftName}
          saveError={profileEditor.saveError}
          canSave={profileEditor.canSave}
          busy={profileEditor.isPending}
          onDraftNameChange={profileEditor.setDraftName}
          onSubmit={profileEditor.handleSubmit}
        />
      </div>
    </section>
  );
}

function AccountPageLoading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-3.5" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <header className="grid items-end gap-2">
        <div className="grid gap-1.5">
          <div className="h-12 w-full max-w-72 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-5 w-full max-w-72 animate-pulse rounded-full bg-white/5" />
        </div>
      </header>

      <section className="gt-surface-ink grid gap-4 overflow-hidden rounded-2xl p-0">
        <div className="grid gap-0 px-4 pt-5 pb-6 md:p-5 lg:px-6 lg:pt-5 lg:pb-6">
          <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_1px_minmax(0,1fr)] lg:gap-0">
            <div className="grid grid-cols-1 items-center gap-4 pr-0 md:grid-cols-[auto_minmax(0,1fr)] md:justify-items-start lg:pr-6">
              <div className="grid h-24 w-24 place-items-center rounded-full border border-cyan/20 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.24),transparent_55%),rgba(34,211,238,0.1)] shadow-[inset_0_0_28px_rgba(34,211,238,0.08)]">
                <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="grid min-w-0 gap-2">
                <div className="h-7 w-full max-w-56 animate-pulse rounded-full bg-white/10" />
                <div className="h-4 w-full max-w-72 animate-pulse rounded-full bg-white/5" />
                <div className="flex flex-wrap gap-2.5">
                  <div className="h-6 w-32 animate-pulse rounded-full bg-white/10" />
                  <div className="h-6 w-28 animate-pulse rounded-full bg-white/10" />
                </div>
                <div className="text-sm text-slate-400">Đang tải tài khoản...</div>
              </div>
            </div>

            <div className="h-px w-full self-stretch bg-slate-400/15 lg:h-auto lg:w-px" />

            <div className="grid grid-cols-1 items-center gap-0 pl-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:pl-6">
              <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5 md:min-w-[240px]" />
              <div className="my-2 h-px w-full justify-self-center bg-slate-400/20 lg:my-0 lg:h-16 lg:w-px" />
              <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5 md:min-w-[240px]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 px-4 pb-4 md:px-5 md:pb-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:px-6 lg:pb-6">
          <section className="gt-surface min-h-0">
            <div className="mb-4 h-6 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="grid gap-3.5">
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
              <div className="h-16 animate-pulse rounded-2xl bg-white/6" />
            </div>
          </section>

          <section className="gt-surface min-h-0">
            <div className="mb-4 grid gap-2">
              <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-full max-w-72 animate-pulse rounded-full bg-white/5" />
            </div>
            <div className="grid gap-4">
              <div className="h-12 animate-pulse rounded-xl bg-white/6" />
              <div className="h-12 animate-pulse rounded-xl bg-white/6" />
              <div className="h-12 animate-pulse rounded-xl bg-white/6" />
              <div className="h-14 w-40 animate-pulse rounded-xl bg-white/6" />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
