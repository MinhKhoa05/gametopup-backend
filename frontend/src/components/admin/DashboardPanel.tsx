import { BarChart3, CheckCircle2, Clock3, Gamepad2, Users } from 'lucide-react';
import { Route } from '../../lib/routes';
import { formatCurrency, formatDate } from '../../lib/format';
import { statusLabel } from '../../lib/labels';
import type { Game, Order, User } from '../../types';
import type { AdminCatalogMetrics } from '../../types/admin.type';
import { AdminSkeleton, EmptyLine, PanelTitle } from './AdminShared';
import { IconBox, StatCard } from '../ui';

export function DashboardPanel({
  games,
  loading,
  metrics,
  navigate,
  orders,
  users,
}: {
  games: Game[];
  loading: boolean;
  metrics: AdminCatalogMetrics;
  navigate: (route: Route) => void;
  orders: Order[];
  users: User[];
}) {
  const latestOrders = orders.slice(0, 5);

  return (
    <div className="grid min-w-0 gap-5">
      <div className="flex flex-wrap gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan/10 bg-slate-900/70 px-3.5 py-2 text-[0.86rem] font-semibold text-slate-200">
          <strong className="text-cyan text-base font-bold">{games.length}</strong> Game
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan/10 bg-slate-900/70 px-3.5 py-2 text-[0.86rem] font-semibold text-slate-200">
          <strong className="text-cyan text-base font-bold">{metrics.totalPackages}</strong> Gói nạp
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan/10 bg-slate-900/70 px-3.5 py-2 text-[0.86rem] font-semibold text-slate-200">
          <strong className="text-cyan text-base font-bold">{metrics.disabledPackages}</strong> Đã tắt
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Gamepad2 size={20} />} label="Game đang hoạt động" value={`${metrics.activeGames}/${games.length}`} />
        <StatCard icon={<Clock3 size={20} />} label="Đơn hôm nay" value={metrics.ordersToday.toString()} />
        <StatCard iconClassName="bg-amber-400/10 text-amber-300" icon={<CheckCircle2 size={20} />} label="Đơn đang chờ" value={metrics.pendingOrders.toString()} />
        <StatCard icon={<BarChart3 size={20} />} label="Doanh thu ghi nhận" value={formatCurrency(metrics.paidRevenue)} />
        <StatCard icon={<Users size={20} />} label="Users" value={`${metrics.activeUsers}/${metrics.totalUsers || users.length}`} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
        <div className="gt-surface">
          <PanelTitle title="Đơn hàng gần đây" action="Xem đơn hàng" onAction={() => navigate({ name: 'admin', section: 'orders' })} />
          {loading && latestOrders.length === 0 ? (
            <AdminSkeleton rows={5} />
          ) : latestOrders.length === 0 ? (
            <EmptyLine text="Chưa có đơn hàng nào." />
          ) : (
            <div className="grid gap-2.5">
              {latestOrders.map((order) => (
                <div className="gt-record-row grid-cols-[auto_minmax(0,1fr)_auto]" key={order.id}>
                  <IconBox size="md" className="font-black text-[0.8rem]">
                    #{order.id}
                  </IconBox>
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

        <div className="gt-surface">
          <PanelTitle title="Hướng dẫn nhanh" />
          <div className="rounded-2xl border border-dashed border-white/12 px-6 py-8 text-left leading-6 text-slate-400">
            Vào mục <b>Gói nạp</b>, chọn game ở danh sách bên trái, hệ thống sẽ tải và hiển thị các gói thuộc đúng game đó.
          </div>
        </div>
      </div>
    </div>
  );
}
