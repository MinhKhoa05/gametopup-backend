import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock3, CreditCard, Send, XCircle } from 'lucide-react';
import { Badge, EmptyState, IconBox, SectionHeading } from '../ui';
import { formatCurrency, formatDate } from '../../lib/format';
import { classNames } from '../../lib/ui';

type DepositRequestItem = {
  id: number;
  amount: number;
  transferContent: string;
  createdAt: string;
  status: number;
};

type WalletTransactionItem = {
  id: number;
  type: number;
  description?: string | null;
  createdAt: string;
  amount: number;
  balanceAfter: number;
};

export function DepositRequestList({
  loading,
  requests,
  onCreate,
}: {
  loading: boolean;
  requests: DepositRequestItem[];
  onCreate: () => void;
}) {
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
          {recentRequests.map((request) => (
            <DepositRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </section>
  );
}

export function WalletTransactionList({
  loading,
  transactions,
}: {
  loading: boolean;
  transactions: WalletTransactionItem[];
}) {
  if (loading && transactions.length === 0) {
    return <EmptyState className={walletEmptyStateClassName} title="Đang tải lịch sử ví..." />;
  }

  if (transactions.length === 0) {
    return <EmptyState className={walletEmptyStateClassName} title="Chưa có giao dịch phù hợp." />;
  }

  return (
    <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
      {transactions.map((item) => (
        <WalletTransactionCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function DepositRequestCard({ request }: { request: DepositRequestItem }) {
  const status = getDepositRequestStatus(request.status);

  return (
    <div className="grid gap-4 px-6 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
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
}

function WalletTransactionCard({ item }: { item: WalletTransactionItem }) {
  const group = getTransactionGroup(item.type);
  const decrease = isDecreaseTransaction(item.type);

  return (
    <div className="grid gap-4 px-6 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
      <IconBox
        size="md"
        className={classNames(
          '!bg-cyan/10 !text-cyan',
          group === 'withdraw' && '!bg-rose-500/10 !text-rose-300',
          group === 'paid' && '!bg-rose-500/10 !text-rose-300',
          group === 'refund' && '!bg-emerald-500/10 !text-emerald-300',
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
        <strong className={classNames('block text-lg font-black', decrease ? 'text-rose-300' : 'text-emerald-300')}>
          {decrease ? '-' : '+'}
          {formatCurrency(item.amount)}
        </strong>
        <span className="block text-sm text-slate-400">Còn lại {formatCurrency(item.balanceAfter)}</span>
      </div>
    </div>
  );
}

const walletEmptyStateClassName = 'border-x-0 border-b-0 border-t border-white/5 rounded-none bg-transparent p-6';

function getTransactionGroup(type: number) {
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
