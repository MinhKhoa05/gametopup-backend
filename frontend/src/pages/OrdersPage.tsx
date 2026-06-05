import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge, Button, EmptyState, SearchBar, IconBox } from '../components/ui';
import { Route } from '../lib/routes';
import { formatCurrency, formatDate } from '../lib/format';
import { statusLabel } from '../lib/labels';
import { classNames } from '../lib/ui';
import { useUserOrders } from '../hooks/orders.hooks';
import type { User } from '../types';

export function OrdersPage({
  user,
  navigate,
}: {
  user: User | null;
  navigate: (route: Route) => void;
}) {
  const [query, setQuery] = useState('');
  const isLoggedIn = Boolean(user);
  const userOrders = useUserOrders(isLoggedIn);

  const filteredOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return userOrders.orders;

    return userOrders.orders.filter((order) => {
      return [order.id, order.gamePackageId, order.gameAccountInfo, order.status]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [query, userOrders.orders]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-white">Đơn Hàng Của Tôi</h1>
        <SearchBar
          className="max-w-md flex-1"
          inputClassName="text-sm"
          placeholder="Tìm mã đơn hàng..."
          ariaLabel="Tìm mã đơn hàng"
          value={query}
          onChange={setQuery}
        />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {['Tất cả', 'Chờ xử lý', 'Đã hoàn thành', 'Đã hủy'].map((label, index) => (
          <button
            key={label}
            type="button"
            className={classNames(
              'whitespace-nowrap border-b-2 px-5 py-3 text-sm font-bold transition-colors',
              index === 0 ? 'border-cyan text-cyan-50' : 'border-transparent text-slate-400 hover:border-cyan/25 hover:text-cyan-50',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <EmptyState className="py-12">
            {query.trim() ? `Không tìm thấy đơn hàng phù hợp với "${query}".` : 'Bạn chưa có đơn hàng nào.'}
          </EmptyState>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="grid gap-4 rounded-2xl border border-white/5 bg-ink-lighter p-4 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center"
            >
              <IconBox size="md" className="font-black text-[0.8rem]">
                #{order.id}
              </IconBox>
              <div className="min-w-0">
                <strong className="block text-lg text-white">
                  Đơn hàng #{order.id} - Gói nạp ID: {order.gamePackageId}
                </strong>
                <span className="mt-1 block text-sm text-slate-400">
                  Tài khoản: {order.gameAccountInfo} • Số lượng: {order.quantity}
                </span>
                <span className="mt-1 block text-xs text-slate-500">{formatDate(order.createdAt)}</span>
              </div>
              <div className="text-left md:text-right">
                <strong className="mb-2 block text-xl text-cyan">
                  {formatCurrency(order.total || order.unitPrice * order.quantity)}
                </strong>
                <Badge
                  className="ml-auto w-fit"
                  icon={order.status === 0 ? <Clock size={14} /> : order.status === 1 ? <CheckCircle2 size={14} /> : order.status === 2 ? <XCircle size={14} /> : null}
                  variant={order.status === 0 ? 'warning' : order.status === 1 ? 'success' : order.status === 2 ? 'danger' : 'default'}
                >
                  {statusLabel(order.status)}
                </Badge>
              </div>
              <div className="md:border-l md:border-white/5 md:pl-4">
                {order.status === 0 ? (
                  <Button className="min-h-10 px-6 py-2 text-sm" variant="accent" onClick={() => userOrders.handlePay(order.id)} disabled={userOrders.busy}>
                    Thanh toán
                  </Button>
                ) : (
                  <Button className="min-h-10 px-6 py-2 text-sm" onClick={() => navigate({ name: 'games' })}>
                    Mua lại
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
