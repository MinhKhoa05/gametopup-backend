import { ArrowLeft, ArrowDownLeft, ArrowUpRight, History, ShieldCheck, WalletCards } from 'lucide-react';
import { ActionCard, Badge, Button, EmptyState, IconBox, SectionHeading, StatCard } from '../components/ui';
import { WalletPanel } from '../components/wallet/WalletPanel';
import { DepositRequestList, WalletTransactionList } from '../components/wallet/WalletActivityLists';
import { SITE } from '../config/site';
import { formatCurrency } from '../lib/format';
import { useAuthSession } from '../hooks/auth.hooks';
import { useRoute } from '../hooks/common/route.hooks';
import { useWalletPage } from '../hooks/wallet.hooks';

const transactionFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nạp tiền', value: 'deposit' },
  { label: 'Rút tiền', value: 'withdraw' },
  { label: 'Thanh toán', value: 'paid' },
  { label: 'Hoàn tiền', value: 'refund' },
] as const;

export function WalletPage() {
  const { navigate } = useRoute();
  const auth = useAuthSession();
  const user = auth.user;
  const walletPage = useWalletPage({ isLoggedIn: auth.isLoggedIn });

  if (!user) {
    return (
      <EmptyState
        className="mx-auto mt-12 max-w-lg"
        icon={<IconBox className="mx-auto mb-4" size="lg"><WalletCards size={24} /></IconBox>}
        title="Bạn chưa đăng nhập"
        description="Vui lòng đăng nhập để quản lý ví và nạp tiền."
        actionLabel="Đăng nhập ngay"
        onAction={() => navigate({ name: 'auth' })}
      />
    );
  }

  if (walletPage.view === 'deposit' || walletPage.deposit.deposit) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Button
          className="border-cyan/25 bg-transparent text-cyan-50 hover:bg-cyan/10 hover:text-cyan-50"
          onClick={() => {
            walletPage.deposit.setDeposit(null);
            walletPage.setView('overview');
          }}
        >
          <ArrowLeft size={16} />
          Quay lại ví
        </Button>

        <section className={walletHeroClassName}>
          <div className="space-y-2">
            <p className="gt-eyebrow">Nạp ví</p>
            <h1>Nạp số dư ví</h1>
            <p>Quét mã VietQR, chuyển đúng nội dung và xác nhận để hệ thống ghi nhận yêu cầu.</p>
          </div>
          <StatCard
            className="md:min-w-56"
            icon={<WalletCards size={20} />}
            label="Số dư khả dụng"
            value={formatCurrency(walletPage.wallet?.balance || 0)}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <WalletPanel
              user={user}
              wallet={walletPage.wallet}
              amount={walletPage.deposit.depositAmount}
              setAmount={walletPage.deposit.setDepositAmount}
              deposit={walletPage.deposit.deposit}
              busy={walletPage.deposit.createDepositPending || walletPage.deposit.confirmDepositPending}
              createDepositPending={walletPage.deposit.createDepositPending}
              confirmDepositPending={walletPage.deposit.confirmDepositPending}
              onSubmit={walletPage.deposit.handleCreateDeposit}
              onConfirm={walletPage.deposit.handleConfirmTransfer}
            />
          </main>

          <aside className="grid gap-4">
            <div className="gt-surface-ink rounded-2xl p-6">
              <h3 className="mb-4 text-lg font-black text-white">Lưu ý khi nạp tiền</h3>
              <ul className="grid gap-3 text-sm leading-6 text-slate-400">
                <li>Nội dung chuyển khoản phải chính xác như hệ thống cung cấp.</li>
                <li>Mã QR đã bao gồm số tiền và nội dung nạp.</li>
                <li>Sau khi chuyển khoản, hãy nhấn “Xác nhận đã chuyển khoản” để gửi yêu cầu duyệt.</li>
                <li>Yêu cầu nạp tiền sẽ ở trạng thái chờ admin kiểm tra.</li>
                <li>Thời gian kiểm tra thường khoảng 10-15 phút, có thể lâu hơn tùy tình trạng giao dịch.</li>
                <li>Số dư chỉ được cộng sau khi admin xác nhận giao dịch thành công.</li>
              </ul>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-cyan/15 bg-cyan/10 p-6 text-slate-300">
              <ShieldCheck size={24} />
              <div className="min-w-0">
                <strong className="block text-white">Không tự sửa nội dung chuyển khoản</strong>
                <span className="mt-1 block text-sm leading-6">Hệ thống đối soát theo mã nạp riêng của từng yêu cầu.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className={`${walletHeroClassName} md:p-7`}>
        <div className="space-y-4">
          <SectionHeading
            eyebrow={`Ví ${SITE.name}`}
            title="Quản lý số dư"
            description="Theo dõi biến động ví, nạp tiền và xem lịch sử giao dịch của tài khoản."
          />
          <div className="flex flex-wrap gap-2" aria-label="Thông tin nhanh">
            <Badge>VietQR an toàn</Badge>
            <Badge>Cập nhật tức thời</Badge>
            <Badge>Lịch sử rõ ràng</Badge>
          </div>
        </div>
        <StatCard className="md:min-w-56" icon={<WalletCards size={20} />} label="Số dư khả dụng" value={formatCurrency(walletPage.wallet?.balance || 0)} />
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <ActionCard
          icon={
            <IconBox size="sm">
              <ArrowDownLeft size={18} />
            </IconBox>
          }
          title="Nạp tiền"
          description="Tạo mã QR chuyển khoản VietQR."
          onClick={() => walletPage.setView('deposit')}
        />

        <ActionCard
          icon={
            <IconBox size="sm">
              <ArrowUpRight size={18} />
            </IconBox>
          }
          title="Rút tiền"
          description="Chức năng đang được phát triển."
          disabled
          className="opacity-65"
        />
      </div>

      <DepositRequestList
        loading={walletPage.depositRequests.depositRequestsLoading}
        requests={walletPage.depositRequests.depositRequests}
        onCreate={() => walletPage.setView('deposit')}
      />

      <section className="gt-surface-ink rounded-2xl">
        <SectionHeading
          className="px-6 pt-6"
          action={<History size={22} />}
          title="Lịch sử ví"
          description="Phân loại giao dịch nạp, rút, thanh toán và hoàn tiền."
        />

        <div className="flex gap-2 overflow-x-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {transactionFilters.map((item) => (
            <Button
              key={item.value}
              variant={walletPage.filter === item.value ? 'accent' : 'default'}
              className="min-h-10 whitespace-nowrap rounded-full px-3.5 py-2 text-sm"
              onClick={() => walletPage.setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <WalletTransactionList loading={walletPage.transactionLoading} transactions={walletPage.filteredTransactions} />
      </section>
    </div>
  );
}

const walletHeroClassName =
  'grid gap-4 rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(207,250,254,0.34),transparent_34%),linear-gradient(135deg,var(--gt-hero-start),var(--gt-hero-end))] p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center';
