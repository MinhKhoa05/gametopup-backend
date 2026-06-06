import { ArrowLeft, ArrowDownLeft, ArrowUpRight, CheckCircle2, History, ShieldCheck, WalletCards } from 'lucide-react';
import { ActionCard, Badge, Button, EmptyState, IconBox, SectionHeading, StatCard } from '../components/ui';
import { DepositRequestList, WalletPanel, WalletTransactionList } from '../components/wallet';
import { SITE } from '../config/site';
import { formatCurrency } from '../lib/format';
import { useAuthSession } from '../hooks/auth.hooks';
import { useRoute } from '../hooks/common/route.hooks';
import { useWalletPage } from '../hooks/wallet.hooks';
import { TRANSACTION_FILTERS, WALLET_DEPOSIT_WARNING, walletHeroClassName } from './wallet-page.data';

export function WalletPage() {
  const { navigate } = useRoute();
  const { isLoggedIn, user } = useAuthSession();
  const walletPage = useWalletPage({ isLoggedIn });
  const {
    deposit,
    depositRequests,
    filteredTransactions,
    filter,
    setFilter,
    setView,
    transactionLoading,
    view,
    wallet,
  } = walletPage;

  if (!user) {
    return (
      <EmptyState
        className="mx-auto mt-12 max-w-lg"
        icon={
          <IconBox className="mx-auto mb-4" size="lg">
            <WalletCards size={24} />
          </IconBox>
        }
        title="Bạn chưa đăng nhập"
        description="Vui lòng đăng nhập để quản lý ví và nạp tiền."
        actionLabel="Đăng nhập ngay"
        onAction={() => navigate({ name: 'auth' })}
      />
    );
  }

  if (view === 'deposit' || deposit.deposit) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-5">
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

        <section className="grid gap-4 rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,var(--gt-hero-start),var(--gt-hero-end))] p-5 md:grid-cols-[minmax(0,1fr)_280px] md:items-center md:p-6">
          <div className="space-y-3">
            <Badge variant="accent" className="uppercase tracking-[0.18em]">
              Nạp ví VietQR
            </Badge>
            <div className="space-y-2">
              <h1 className="text-[clamp(2rem,4.2vw,3.1rem)] font-black leading-[0.95] tracking-tight text-white">
                Nạp ví
                <br />
                <span className="text-cyan">nhanh, rõ và đúng chuẩn</span>
              </h1>
              <p className="max-w-2xl text-[0.95rem] leading-6 text-slate-300 sm:text-base">
                Quét mã VietQR, chuyển đúng số tiền và nội dung để hệ thống tự động ghi nhận yêu cầu nạp của bạn.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>VietQR tự động</Badge>
              <Badge>Đối soát theo mã nạp</Badge>
              <Badge>Cập nhật trạng thái tức thì</Badge>
            </div>
          </div>

          <div className="grid gap-3">
            <StatCard icon={<WalletCards size={20} />} label="Số dư khả dụng" value={formatCurrency(wallet?.balance || 0)} />
            <div className="rounded-2xl border border-white/8 bg-slate-950/25 p-4 text-sm leading-6 text-slate-300">
              Mỗi yêu cầu nạp có mã riêng. Chỉ cần chuyển đúng nội dung là hệ thống sẽ nhận diện tự động.
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <WalletPanel
              user={user}
              wallet={wallet}
              deposit={deposit.deposit}
              depositState={{
                amount: deposit.depositAmount,
                busy: deposit.createDepositPending || deposit.confirmDepositPending,
                confirmDepositPending: deposit.confirmDepositPending,
                createDepositPending: deposit.createDepositPending,
                onConfirm: deposit.handleConfirmTransfer,
                onSubmit: deposit.handleCreateDeposit,
                setAmount: deposit.setDepositAmount,
              }}
            />
          </main>

          <aside className="grid gap-4 self-start lg:sticky lg:top-24">
            <section className="gt-surface-ink rounded-2xl p-5">
              <div className="mb-4 flex items-center gap-3">
                <IconBox size="md" className="border border-cyan/15 bg-cyan/10 text-cyan-50">
                  <ShieldCheck size={18} />
                </IconBox>
                <div>
                  <p className="gt-eyebrow">Lưu ý khi nạp tiền</p>
                  <h3 className="m-0 text-lg font-black text-white">Đọc nhanh trước khi chuyển khoản</h3>
                </div>
              </div>

              <div className="grid gap-3">
                <ActionCard
                  icon={
                    <IconBox size="sm" className="border border-cyan/15 bg-cyan/10 text-cyan-50">
                      <ShieldCheck size={16} />
                    </IconBox>
                  }
                  title="Chỉ đúng nội dung"
                  description="Nhập đúng nội dung."
                  className="p-4"
                />
                <ActionCard
                  icon={
                    <IconBox size="sm" className="border border-emerald-400/15 bg-emerald-400/10 text-emerald-300">
                      <WalletCards size={16} />
                    </IconBox>
                  }
                  title="Đúng số tiền"
                  description="Chuyển đúng số tiền hiển thị."
                  className="p-4"
                />
                <ActionCard
                  icon={
                    <IconBox size="sm" className="border border-violet-400/15 bg-violet-400/10 text-violet-300">
                      <CheckCircle2 size={16} />
                    </IconBox>
                  }
                  title="Xác nhận sau khi chuyển"
                  description="Bấm xác nhận sau khi xong."
                  className="p-4"
                />
                <ActionCard
                  icon={
                    <IconBox size="sm" className="border border-amber-400/15 bg-amber-400/10 text-amber-300">
                      <History size={16} />
                    </IconBox>
                  }
                  title="Admin duyệt 10 - 15 phút"
                  description="Số dư cập nhật sau khi duyệt."
                  className="p-4"
                />
                <ActionCard
                  icon={
                    <IconBox size="sm" className="border border-sky-400/15 bg-sky-400/10 text-sky-300">
                      <ShieldCheck size={16} />
                    </IconBox>
                  }
                  title="Cần hỗ trợ?"
                  description="Liên hệ CSKH nếu quá 15 phút."
                  className="p-4"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-cyan/15 bg-cyan/8 p-5 text-slate-300">
              <strong className="block text-white">{WALLET_DEPOSIT_WARNING.title}</strong>
              <span className="mt-1 block text-sm leading-6">{WALLET_DEPOSIT_WARNING.description}</span>
            </section>
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
            <Badge>Cập nhật tức thì</Badge>
            <Badge>Lịch sử rõ ràng</Badge>
          </div>
        </div>
        <StatCard icon={<WalletCards size={20} />} label="Số dư khả dụng" value={formatCurrency(wallet?.balance || 0)} />
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
        loading={depositRequests.depositRequestsLoading}
        requests={depositRequests.depositRequests}
        onCreate={() => setView('deposit')}
      />

      <section className="gt-surface-ink rounded-2xl">
        <SectionHeading
          className="px-6 pt-6"
          action={<History size={22} />}
          title="Lịch sử ví"
          description="Phân loại giao dịch nạp, rút, thanh toán và hoàn tiền."
        />

        <div className="flex gap-2 overflow-x-auto px-6 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRANSACTION_FILTERS.map((item) => (
            <Button
              key={item.value}
              variant={filter === item.value ? 'accent' : 'default'}
              className="min-h-10 whitespace-nowrap rounded-full px-3.5 py-2 text-sm"
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <WalletTransactionList loading={transactionLoading} transactions={filteredTransactions} />
      </section>
    </div>
  );
}
