import { AccountSummary } from './AccountSummary';
import { AccountQuickActions } from './AccountQuickActions';
import { AccountProfileForm } from './AccountProfileForm';
import type { Route } from '../../lib/routes';
import type { User, WalletInfo } from '../../types';
import type { useProfileEditor } from '../../hooks/user.hooks';

type AccountProfileSectionProps = {
  user: User;
  wallet: WalletInfo | null;
  ordersCount: number;
  busy: boolean;
  navigate: (route: Route) => void;
  onLogout: () => void;
  profileEditor: ReturnType<typeof useProfileEditor>;
};

export function AccountProfileSection({
  user,
  wallet,
  ordersCount,
  busy,
  navigate,
  onLogout,
  profileEditor,
}: AccountProfileSectionProps) {
  return (
    <section className="grid gap-4 overflow-hidden rounded-[16px] border border-white/5 bg-ink-light p-0">
      <AccountSummary user={user} wallet={wallet} ordersCount={ordersCount} />

      <div className="account-bottom-grid">
        <AccountQuickActions navigate={navigate} onLogout={onLogout} />

        <AccountProfileForm
          email={user.email}
          draftName={profileEditor.draftName}
          saveError={profileEditor.saveError}
          canSave={profileEditor.canSave}
          busy={busy}
          onDraftNameChange={profileEditor.setDraftName}
          onSubmit={profileEditor.handleSubmit}
        />
      </div>
    </section>
  );
}