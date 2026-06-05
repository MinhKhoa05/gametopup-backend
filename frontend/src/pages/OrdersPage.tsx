import { EmptyState, SearchBar } from '../components/ui';
import { OrderCard } from '../components/orders/OrderCard';
import { classNames } from '../lib/ui';
import { useOrdersPage } from '../hooks/orders.hooks';

export function OrdersPage() {
  const ordersPage = useOrdersPage();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-white">Đơn Hàng Của Tôi</h1>
        <SearchBar
          className="max-w-md flex-1"
          inputClassName="text-sm"
          placeholder="Tìm mã đơn hàng..."
          ariaLabel="Tìm mã đơn hàng"
          value={ordersPage.query}
          onChange={ordersPage.setQuery}
        />
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {orderTabs.map((label, index) => (
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
        {ordersPage.filteredOrders.length === 0 ? (
          <EmptyState className="py-12">
            {ordersPage.query.trim() ? `Không tìm thấy đơn hàng phù hợp với "${ordersPage.query}".` : 'Bạn chưa có đơn hàng nào.'}
          </EmptyState>
        ) : (
          ordersPage.filteredOrders.map((order) => <OrderCard key={order.id} busy={ordersPage.busy} order={order} onPay={ordersPage.onPay} />)
        )}
      </div>
    </div>
  );
}

const orderTabs = ['Tất cả', 'Chờ xử lý', 'Đã hoàn thành', 'Đã hủy'];
