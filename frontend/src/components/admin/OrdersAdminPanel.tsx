import { useMemo, useState } from 'react';
import { CheckCircle2, CircleSlash, Send, TriangleAlert } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/format';
import { statusLabel } from '../../lib/labels';
import { classNames } from '../../lib/ui';
import type { Order } from '../../types';
import { AdminSkeleton, EmptyLine, PanelTitle, SearchBox, StatusPill } from './AdminShared';
import { Badge } from '../ui/Badge';
import type { User } from '../../types';

type OrderFilter = 'all' | 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

const FILTERS: Array<{ key: OrderFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

export function OrdersAdminPanel({
  busy,
  loading,
  orders,
  currentUser,
  onPickOrder,
  onCompleteOrder,
  onCancelOrder,
}: {
  busy: boolean;
  loading: boolean;
  orders: Order[];
  currentUser: User | null;
  onPickOrder: (orderId: number) => Promise<void>;
  onCompleteOrder: (orderId: number) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('all');

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && order.status === 1) ||
        (filter === 'paid' && order.status === 2) ||
        (filter === 'processing' && order.status === 3) ||
        (filter === 'completed' && order.status === 4) ||
        (filter === 'cancelled' && order.status === 5);

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [String(order.id), String(order.userId), String(order.gamePackageId), order.gameAccountInfo, statusLabel(order.status)].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [filter, orders, query]);

  return (
    <div className="grid gap-5">
      <div className="gametopup-surface grid gap-4">
        <PanelTitle title="Bộ lọc đơn hàng" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm theo mã đơn, user, package..." />
        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={classNames(
                'min-h-10 rounded-full border border-white/10 bg-white/5 px-3.5 font-bold text-slate-200 transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px hover:border-cyanline/24 hover:bg-cyanline/10 hover:text-cyan-50',
                filter === item.key && 'border-cyanline/24 bg-cyanline/10 text-cyan-50',
              )}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gametopup-surface">
        <PanelTitle title="Danh sách đơn hàng" />

        {loading && filteredOrders.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredOrders.length === 0 ? (
          <EmptyLine text="Không tìm thấy đơn hàng phù hợp." />
        ) : (
          <div className="admin-table">
            {filteredOrders.map((order) => {
              const isProcessing = order.status === 3;
              const canPick = order.status === 2;
              const canComplete = isProcessing && order.assignedTo === currentUser?.id;
              const canCancel = isProcessing && order.assignedTo === currentUser?.id;

              return (
                <article className="gametopup-record-row grid-cols-[auto_minmax(0,1.2fr)_minmax(140px,auto)_auto_auto] max-[700px]:grid-cols-1" key={order.id}>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyanline/10 text-[0.8rem] font-black text-cyanline">
                    #{order.id}
                  </div>
                  <div>
                    <strong>
                      Đơn #{order.id} · User #{order.userId} · Gói #{order.gamePackageId}
                    </strong>
                    <small>
                      {order.gameAccountInfo} · SL {order.quantity} · {formatDate(order.createdAt)}
                    </small>
                    <small>
                      Cập nhật: {formatDate(order.updatedAt)}
                      {order.assignedTo ? ` · Giao cho #${order.assignedTo}` : ''}
                    </small>
                  </div>

                  <div className="grid justify-items-end gap-1.5 max-[700px]:justify-items-start">
                    <b>{formatCurrency(order.total ?? order.unitPrice * order.quantity)}</b>
                    <StatusPill active={order.status === 4} />
                  </div>

                  <div className="flex justify-end max-[700px]:justify-start">
                    <Badge tone={toneForStatus(order.status)}>{statusLabel(order.status)}</Badge>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 max-[700px]:justify-start">
                    {canPick && (
                      <button type="button" className="btn-secondary min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void onPickOrder(order.id)}>
                        <Send size={16} />
                        Tiếp nhận
                      </button>
                    )}

                    {canComplete && (
                      <button type="button" className="btn-primary min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void onCompleteOrder(order.id)}>
                        <CheckCircle2 size={16} />
                        Hoàn thành
                      </button>
                    )}

                    {canCancel && (
                      <button type="button" className="btn-secondary min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void onCancelOrder(order.id)}>
                        <CircleSlash size={16} />
                        Hủy
                      </button>
                    )}

                    {!canPick && !canComplete && !canCancel && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-400/10 px-2.5 py-2 text-[0.8rem] font-semibold text-slate-300">
                        <TriangleAlert size={14} />
                        {isProcessing && order.assignedTo !== currentUser?.id ? 'Đơn đang được admin khác xử lý.' : 'Không có thao tác phù hợp.'}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function toneForStatus(status: number) {
  switch (status) {
    case 1:
      return 'warning';
    case 2:
      return 'info';
    case 3:
      return 'default';
    case 4:
      return 'success';
    case 5:
      return 'danger';
    default:
      return 'default';
  }
}
