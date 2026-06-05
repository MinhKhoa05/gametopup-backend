import { FormEvent, useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  History,
  QrCode,
  Send,
  ShieldCheck,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { ActionCard, Badge, Button, EmptyState, IconBox, SectionHeading, StatCard } from '../components/ui';
import { WalletPanel } from '../components/wallet/WalletPanel';
import { SITE } from '../config/site';
import { formatCurrency, formatDate } from '../lib/format';
import { Route } from '../lib/routes';
import { classNames } from '../lib/ui';
import { useDepositRequests, useWalletDeposit, useWalletTransactions } from '../hooks/wallet.hooks';
import type { DepositRequest, User, WalletInfo, WalletTransaction } from '../types';

const quickAmounts = [50000, 100000, 200000, 500000];
const bankNames: Record<string, string> = {
  acb: 'ACB',
  bidv: 'BIDV',
  mbbank: 'MB Bank',
  mb: 'MB Bank',
  tcb: 'Techcombank',
  techcombank: 'Techcombank',
  vcb: 'Vietcombank',
  vietcombank: 'Vietcombank',
  vietinbank: 'VietinBank',
  vtb: 'VietinBank',
  vpbank: 'VPBank',
};
const transactionFilters = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nạp tiền', value: 'deposit' },
  { label: 'Rút tiền', value: 'withdraw' },
  { label: 'Thanh toán', value: 'paid' },
  { label: 'Hoàn tiền', value: 'refund' },
] as const;

const walletHeroClassName =
  'grid gap-4 rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(207,250,254,0.34),transparent_34%),linear-gradient(135deg,var(--gt-hero-start),var(--gt-hero-end))] p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center';

const walletEmptyStateClassName = 'border-x-0 border-b-0 border-t border-white/5 rounded-none bg-transparent p-6';

type WalletView = 'overview' | 'deposit';
type TransactionFilter = (typeof transactionFilters)[number]['value'];

export function WalletPage({
  wallet,
  user,
  navigate,
}: {
  wallet: WalletInfo | null;
  user: User | null;
  navigate: (route: Route) => void;
}) {
  const [view, setView] = useState<WalletView>('overview');
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const isLoggedIn = Boolean(user);
  const walletTransactions = useWalletTransactions(isLoggedIn);
  const depositRequests = useDepositRequests(isLoggedIn);
  const deposit = useWalletDeposit();
  const busy = deposit.createDepositPending || deposit.confirmDepositPending;
  const filteredTransactions = useMemo(
    () => walletTransactions.transactions.filter((item) => filter === 'all' || getTransactionGroup(item.type) === filter),
    [filter, walletTransactions.transactions],
  );

  if (!user) {
    return (
      <EmptyState
        className="mx-auto mt-12 max-w-lg"
        icon={<IconBox className="mx-auto mb-4" size="lg"><WalletCards size={24} /></IconBox>}
        title="Bạn chưa đăng nhập"
        description="Vui lòng đăng nhập để quản lý ví và nạp tiền."
        actionLabel="Đăng nhập ngay"
        onAction={() => navigate({ name: 'account' })}
      />
    );
  }

  if (view === 'deposit' || deposit.deposit) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-4">
      <Button
        className="border-cyan/25 bg-transparent text-cyan-50 hover:bg-cyan/10 hover:text-cyan-50"
        onClick={() => {
            deposit.setDeposit(null);
            setView('overview');
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
            value={formatCurrency(wallet?.balance || 0)}
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0">
            <WalletPanel
              user={user}
              wallet={wallet}
              amount={deposit.depositAmount}
              setAmount={deposit.setDepositAmount}
              deposit={deposit.deposit}
              busy={busy || deposit.createDepositPending || deposit.confirmDepositPending}
              createDepositPending={deposit.createDepositPending}
              confirmDepositPending={deposit.confirmDepositPending}
              onSubmit={deposit.handleCreateDeposit}
              onConfirm={deposit.handleConfirmTransfer}
              navigate={navigate}
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
        <StatCard className="md:min-w-56" icon={<WalletCards size={20} />} label="Số dư khả dụng" value={formatCurrency(wallet?.balance || 0)} />
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
          onClick={() => setView('deposit')}
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

      <DepositRequestList loading={depositRequests.depositRequestsLoading} requests={depositRequests.depositRequests} onCreate={() => setView('deposit')} />

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
            variant={filter === item.value ? 'accent' : 'default'}
            className="min-h-10 whitespace-nowrap rounded-full px-3.5 py-2 text-sm"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
          ))}
        </div>

        <WalletTransactionList loading={walletTransactions.transactionsLoading} transactions={filteredTransactions} />
      </section>
    </div>
  );
}

function DepositRequestList({ loading, requests, onCreate }: { loading: boolean; requests: DepositRequest[]; onCreate: () => void }) {
  const recentRequests = requests.slice(0, 4);

  return (
    <section className="gt-surface-ink rounded-2xl">
      <SectionHeading
        className="px-6 pt-6"
        action={<Send size={22} />}
        title="Yêu cầu nạp gần đây"
        description="Theo dõi các yêu cầu đã gửi và trạng thái admin duyệt."
      />

      {loading && recentRequests.length === 0 ? (
        <EmptyState className={walletEmptyStateClassName} title="Đang tải yêu cầu nạp..." />
      ) : recentRequests.length === 0 ? (
        <EmptyState
          className={walletEmptyStateClassName}
          title="Chưa có yêu cầu nạp nào."
          description="Hãy tạo yêu cầu mới để hệ thống cấp mã VietQR."
          actionLabel="Tạo yêu cầu nạp"
          onAction={onCreate}
        />
      ) : (
        <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {recentRequests.map((request) => {
            const status = getDepositRequestStatus(request.status);

            return (
              <div key={request.id} className="grid gap-4 px-6 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                <IconBox
                  size="md"
                  className={classNames(
                    '!bg-blue-500/10 !text-blue-300',
                    status.tone === 'reviewing' && '!bg-amber-400/10 !text-amber-300',
                    status.tone === 'approved' && '!bg-emerald-500/10 !text-emerald-300',
                    status.tone === 'rejected' && '!bg-rose-500/10 !text-rose-300',
                  )}
                >
                  {status.icon}
                </IconBox>
                <div className="min-w-0">
                  <strong className="block text-base font-black text-white">{formatCurrency(request.amount)}</strong>
                  <span className="mt-1 block break-words text-sm text-slate-300">{request.transferContent}</span>
                  <small className="mt-1 block text-xs font-semibold text-slate-500">{formatDate(request.createdAt)}</small>
                </div>
                <div className="grid gap-2 text-left md:max-w-56 md:justify-self-end md:text-right">
                  <Badge
                    variant={status.tone === 'approved' ? 'success' : status.tone === 'reviewing' ? 'accent' : status.tone === 'rejected' ? 'danger' : 'warning'}
                    icon={status.icon}
                  >
                    {status.label}
                  </Badge>
                  <span className="text-sm leading-5 text-slate-400">{status.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DepositAmountForm({ amount, busy, onSubmit, setAmount }: { amount: number; busy: boolean; onSubmit: (event: FormEvent) => void; setAmount: (value: number) => void }) {
  return (
    <form onSubmit={onSubmit} className="gt-surface-ink rounded-2xl p-6">
      <SectionHeading className="mb-6" action={<IconBox size="md"><WalletCards size={22} /></IconBox>} title="Tạo lệnh nạp" description="Chọn số tiền muốn nạp vào ví của bạn." />

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium text-slate-200">Số tiền cần nạp</span>
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
          min={10000}
          step={10000}
          className="w-full min-h-12 rounded-xl border border-white/10 bg-ink-lighter px-4 text-white outline-none transition-colors focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
        />
      </label>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Chọn nhanh số tiền nạp">
        {quickAmounts.map((value) => (
          <button
            key={value}
            type="button"
            className={classNames(
              'rounded-xl border px-3 py-3 text-sm font-bold transition-colors',
              amount === value
                  ? 'border-cyan bg-cyan/15 text-cyan-50'
                  : 'border-white/10 bg-[rgba(255,255,255,0.03)] text-slate-300 hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.04)]',
            )}
            onClick={() => setAmount(value)}
          >
            {formatCurrency(value)}
          </button>
        ))}
      </div>

            <Button type="submit" variant="accent" className="w-full text-lg" disabled={amount < 10000 || busy}>
              Tạo lệnh nạp <ArrowRight size={20} />
            </Button>
    </form>
  );
}

function WalletNotes() {
  return (
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
  );
}

function DepositQrPanel({ deposit, busy, onConfirm }: { deposit: DepositRequest; busy: boolean; onConfirm: () => void }) {
  const bankCode = deposit.bankId?.trim().toLowerCase() || '';
  const bankName = bankNames[bankCode] ?? deposit.bankId?.toUpperCase() ?? 'Ngân hàng';
  const accountNo = deposit.accountNo || '--';
  const accountName = deposit.accountName || '--';

  return (
    <div className="gt-surface-ink rounded-2xl p-6">
      <SectionHeading
        className="mb-6"
        action={<IconBox size="md"><QrCode size={22} /></IconBox>}
        title="Thanh toán bằng VietQR"
        description="Mở ứng dụng ngân hàng, quét mã và kiểm tra thông tin trước khi chuyển."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-4">
          <img src={deposit.qrImageUrl} alt="Mã QR chuyển khoản VietQR" />
        </div>

        <div className="grid gap-2 rounded-2xl gt-panel p-4">
          <InfoRow label="Số tiền" value={formatCurrency(deposit.amount)} highlight />
          <InfoRow label="Ngân hàng" value={bankName} />
          <InfoRow label="Số tài khoản" value={accountNo} copyValue={accountNo} />
          <InfoRow label="Chủ tài khoản" value={accountName} />
          <InfoRow label="Nội dung nạp" value={deposit.transferContent} copyValue={deposit.transferContent} code />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-cyan/15 bg-cyan/10 px-4 py-3 text-sm text-slate-300">
        <CheckCircle2 size={20} />
        <span>Chỉ xác nhận sau khi bạn đã chuyển khoản thành công.</span>
      </div>

      <Button className="mt-4 h-14 w-full text-lg" type="button" variant="accent" onClick={onConfirm} disabled={busy}>
        Xác nhận đã chuyển khoản
      </Button>
    </div>
  );
}

function WalletTransactionList({ loading, transactions }: { loading: boolean; transactions: WalletTransaction[] }) {
  if (loading && transactions.length === 0) {
    return <EmptyState className={walletEmptyStateClassName} title="Đang tải lịch sử ví..." />;
  }

  if (transactions.length === 0) {
    return <EmptyState className={walletEmptyStateClassName} title="Chưa có giao dịch phù hợp." />;
  }

  return (
    <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
      {transactions.map((item) => (
        <div key={item.id} className="grid gap-4 px-6 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <IconBox
            size="md"
            className={classNames(
              '!bg-cyan/10 !text-cyan',
              getTransactionGroup(item.type) === 'withdraw' && '!bg-rose-500/10 !text-rose-300',
              getTransactionGroup(item.type) === 'paid' && '!bg-rose-500/10 !text-rose-300',
              getTransactionGroup(item.type) === 'refund' && '!bg-emerald-500/10 !text-emerald-300',
            )}
          >
            {getTransactionIcon(item.type)}
          </IconBox>
          <div className="min-w-0">
            <strong className="block text-base font-black text-white">{getTransactionLabel(item.type)}</strong>
            <span className="mt-1 block break-words text-sm text-slate-300">{item.description || `Giao dịch ví #${item.id}`}</span>
            <small className="mt-1 block text-xs font-semibold text-slate-500">{formatDate(item.createdAt)}</small>
          </div>
          <div className="text-left md:text-right">
            <strong className={classNames('block text-lg font-black', isDecreaseTransaction(item.type) ? 'text-rose-300' : 'text-emerald-300')}>
              {isDecreaseTransaction(item.type) ? '-' : '+'}
              {formatCurrency(item.amount)}
            </strong>
            <span className="block text-sm text-slate-400">Còn lại {formatCurrency(item.balanceAfter)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyValue,
  highlight = false,
  code = false,
}: {
  label: string;
  value: string;
  copyValue?: string;
  highlight?: boolean;
  code?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl gt-panel px-4 py-3">
      <span className="text-sm font-semibold text-slate-400">{label}</span>
      <div className="flex items-center gap-2 justify-self-end">
        <strong className={classNames('max-w-[220px] overflow-hidden text-ellipsis text-right text-sm font-black', highlight ? 'text-cyan-50' : 'text-white', code ? 'font-mono tracking-tight' : '')}>
          {value}
        </strong>
        {copyValue && (
          <button
            type="button"
            aria-label={`Sao chép ${label}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-cyan/25 hover:text-cyan-50"
            onClick={() => navigator.clipboard?.writeText(copyValue)}
          >
            <Copy size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function getTransactionGroup(type: number): TransactionFilter {
  if (type === 1) return 'deposit';
  if (type === 2) return 'withdraw';
  if (type === 3) return 'paid';
  if (type === 4) return 'refund';
  return 'all';
}

function getTransactionLabel(type: number) {
  if (type === 1) return 'Nạp tiền';
  if (type === 2) return 'Rút tiền';
  if (type === 3) return 'Thanh toán đơn hàng';
  if (type === 4) return 'Hoàn tiền';
  return `Giao dịch loại ${type}`;
}

function getTransactionIcon(type: number) {
  if (type === 1 || type === 4) return <ArrowDownLeft size={18} />;
  if (type === 2 || type === 3) return <ArrowUpRight size={18} />;
  return <CreditCard size={18} />;
}

function isDecreaseTransaction(type: number) {
  return type === 2 || type === 3;
}

function getDepositRequestStatus(status: number) {
  if (status === 1) {
    return { label: 'Chờ chuyển khoản', description: 'Bạn cần chuyển khoản và xác nhận.', tone: 'pending', icon: <Clock3 size={18} /> };
  }

  if (status === 2) {
    return { label: 'Đã gửi, chờ duyệt', description: 'Admin kiểm tra khoảng 10-15 phút.', tone: 'reviewing', icon: <Send size={18} /> };
  }

  if (status === 3) {
    return { label: 'Đã duyệt', description: 'Số dư đã được cộng vào ví.', tone: 'approved', icon: <CheckCircle2 size={18} /> };
  }

  if (status === 4) {
    return { label: 'Đã từ chối', description: 'Vui lòng kiểm tra lại thông tin.', tone: 'rejected', icon: <XCircle size={18} /> };
  }

  return { label: `Trạng thái ${status}`, description: 'Đang cập nhật thông tin.', tone: 'pending', icon: <Clock3 size={18} /> };
}
