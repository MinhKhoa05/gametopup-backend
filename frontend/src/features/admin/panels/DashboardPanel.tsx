import { BarChart3, CheckCircle2, Clock3, Gamepad2 } from 'lucide-react';
import { Route } from '../../../lib/routes';
import { formatCurrency, formatDate } from '../../../lib/format';
import { statusLabel } from '../../../lib/labels';
import type { Game, Order } from '../../../types';
import type { AdminCatalogMetrics } from '../hooks/useAdminCatalog';
import { AdminSkeleton, EmptyLine, MetricCard, PanelTitle } from '../components/AdminShared';

export function DashboardPanel({
  games,
  loading,
  metrics,
  navigate,
  orders,
}: {
  games: Game[];
  loading: boolean;
  metrics: AdminCatalogMetrics;
  navigate: (route: Route) => void;
  orders: Order[];
}) {
  const latestOrders = orders.slice(0, 5);

  return (
    <div className="admin-stack">
      <div className="admin-quick-stats">
        <span><strong>{games.length}</strong> Game</span>
        <span><strong>{metrics.totalPackages}</strong> Gói nạp</span>
        <span><strong>{metrics.disabledPackages}</strong> Đã tắt</span>
      </div>

      <div className="admin-metrics">
        <MetricCard icon={<Gamepad2 size={20} />} label="Game đang hoạt động" value={`${metrics.activeGames}/${games.length}`} />
        <MetricCard icon={<Clock3 size={20} />} label="Đơn hôm nay" value={metrics.ordersToday.toString()} />
        <MetricCard icon={<CheckCircle2 size={20} />} label="Đơn đang chờ" value={metrics.pendingOrders.toString()} tone="warning" />
        <MetricCard icon={<BarChart3 size={20} />} label="Doanh thu ghi nhận" value={formatCurrency(metrics.paidRevenue)} />
      </div>

      <div className="admin-two-col">
        <div className="admin-panel">
          <PanelTitle title="Đơn hàng gần đây" action="Xem đơn hàng" onAction={() => navigate({ name: 'orders' })} />
          {loading ? (
            <AdminSkeleton rows={5} />
          ) : latestOrders.length === 0 ? (
            <EmptyLine text="Chưa có đơn hàng nào." />
          ) : (
            <div className="admin-list">
              {latestOrders.map((order) => (
                <div className="admin-list-row" key={order.id}>
                  <span className="admin-row-icon">#{order.id}</span>
                  <div>
                    <strong>{statusLabel(order.status)}</strong>
                    <small>
                      {order.gameAccountInfo} · {formatDate(order.createdAt)}
                    </small>
                  </div>
                  <b>{formatCurrency(order.total ?? order.unitPrice * order.quantity)}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <PanelTitle title="Hướng dẫn nhanh" />
          <div className="admin-empty-line admin-summary-note">
            Vào mục <b>Gói nạp</b>, chọn game ở danh sách bên trái, hệ thống sẽ chỉ tải và hiển thị các gói thuộc đúng game đó.
          </div>
        </div>
      </div>
    </div>
  );
}
