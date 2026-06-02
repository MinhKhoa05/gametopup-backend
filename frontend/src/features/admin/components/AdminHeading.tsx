import { RefreshCw } from 'lucide-react';
import { classNames } from '../../../lib/ui';

export function AdminHeading({ loading, onRefresh }: { loading: boolean; onRefresh: () => Promise<void> }) {
  return (
    <div className="admin-heading">
      <div>
        <p className="eyebrow">Bảng điều khiển quản trị</p>
        <h1>Quản trị GameTopUp</h1>
        <p>Theo dõi vận hành, danh mục game và các gói nạp đang hoạt động.</p>
      </div>
      <button type="button" className="btn-outline" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={17} className={classNames(loading && 'animate-spin')} />
        Làm mới
      </button>
    </div>
  );
}
