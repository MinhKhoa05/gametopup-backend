import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import type { AdminGamePackage, Game } from '../../types';
import { useAdminPackagesPanel } from '../../hooks/admin/admin-packages.hooks';
import { Badge, Button, Field } from '../ui';
import { classNames, pickImage } from '../../lib/ui';
import { AdminSkeleton, EmptyLine, NumberField, PanelTitle, SearchBox } from './AdminShared';
import { gameName } from './admin.utils';

export function PackagesAdminPanel({
  busy,
  games,
  packages,
  loading,
  onCreatePackage,
  onUpdatePackage,
  onDeletePackage,
}: {
  busy: boolean;
  games: Game[];
  packages: AdminGamePackage[];
  loading: boolean;
  onCreatePackage: (payload: {
    gameId: number;
    imageUrl: string;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  }) => Promise<void>;
  onUpdatePackage: (
    payload: {
      id: number;
      imageUrl: string;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    },
  ) => Promise<void>;
  onDeletePackage: (id: number) => Promise<void>;
}) {
  const {
    editing,
    previewSrc,
    query,
    remove,
    resetForm,
    scopedPackages,
    selectedGameId,
    setForm,
    setQuery,
    setSelectedGameId,
    startEdit,
    submit,
    form,
  } = useAdminPackagesPanel({
    games,
    packages,
    onCreatePackage,
    onDeletePackage,
    onUpdatePackage,
  });
  const profit = (item: AdminGamePackage) => item.salePrice - item.importPrice;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface grid gap-4">
        <PanelTitle title="Chọn game" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(186px,1fr))] gap-2.5 max-[700px]:grid-cols-[repeat(auto-fit,minmax(152px,1fr))]" role="tablist" aria-label="Chọn game để quản lý gói nạp">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              className={classNames(
                'grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-2.5 rounded-xl border border-white/12 bg-[rgba(255,255,255,0.05)] p-2.5 text-left text-slate-300 transition-colors hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50',
                selectedGameId === game.id && 'border-cyan/25 bg-cyan/10 text-cyan-50',
              )}
              disabled={Boolean(editing)}
              onClick={() => {
                setSelectedGameId(game.id);
                if (!editing) setForm((current) => ({ ...current, gameId: game.id }));
              }}
            >
              <img className="h-10 w-10 rounded-xl bg-cyan/10 object-cover" src={pickImage(game)} alt="" />
              <span className="max-h-10 overflow-hidden whitespace-normal text-[0.98rem] font-bold leading-[1.2]">{game.name}</span>
            </button>
          ))}
        </div>

        <PanelTitle title="Danh sách gói nạp" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm gói nạp..." />

        {loading && games.length === 0 && packages.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : !selectedGameId ? (
          <EmptyLine text="Hãy chọn hoặc tạo game trước." />
        ) : scopedPackages.length === 0 ? (
          <EmptyLine text="Game này chưa có gói nạp nào." />
        ) : (
          <div className="grid gap-2.5">
            {scopedPackages.map((item) => {
              const isEditing = editing?.id === item.id;

              return (
                <div
                  className={classNames(
                    'gt-record-row grid-cols-[auto_minmax(0,1fr)_minmax(140px,auto)_auto_auto] max-[700px]:grid-cols-1',
                    isEditing && 'border-cyan/25 bg-cyan/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.15)]',
                  )}
                  key={item.id}
                >
                  <img className="h-12 w-12 rounded-xl bg-cyan/10 object-cover max-[700px]:h-[54px] max-[700px]:w-[54px]" src={pickImage(item)} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {gameName(games, item.gameId)} · Tồn kho {item.stockQuantity}
                    </small>
                  </div>
                  <div className="grid justify-items-end gap-1.5 max-[700px]:justify-items-start">
                    <b>{formatCurrency(item.salePrice)}</b>
                    <span
                      className={classNames(
                        'rounded-full px-2.5 py-1 text-[0.75rem] font-bold',
                        profit(item) >= 0 ? 'bg-emerald-400/14 text-emerald-200' : 'bg-rose-400/14 text-rose-200',
                      )}
                    >
                      Lãi {profit(item) >= 0 ? '+' : ''}
                      {formatCurrency(profit(item))}
                    </span>
                  </div>
                  <Badge variant={item.isActive ? 'success' : 'default'} icon={item.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                    {item.isActive ? 'Bật' : 'Tắt'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="icon" title="Sửa gói" onClick={() => startEdit(item)}>
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      size="icon"
                      title="Xóa gói"
                      onClick={() => remove(item)}
                      className="!border-rose-400/15 !bg-rose-500/10 !text-rose-200 hover:!border-rose-300/25 hover:!bg-rose-500/15 hover:!text-rose-100 hover:!shadow-[0_8px_24px_rgba(244,63,94,0.10)]"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form className="gt-surface sticky top-24" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật gói nạp' : 'Tạo gói nạp'} />

        <div className="mb-4 grid gap-3">
          <Field label="Tên gói" onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nhập tên gói" required value={form.name} />
          <Field label="Ảnh gói" onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." value={form.imageUrl} />
          <div className="grid min-h-44 place-items-center overflow-hidden rounded-2xl border border-dashed border-slate-400/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%),rgba(15,23,42,0.72)]">
            {previewSrc ? <img className="h-44 w-full object-cover" src={previewSrc} alt="Xem trước ảnh gói" /> : <span className="font-extrabold text-slate-400">Chưa có ảnh</span>}
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <NumberField label="Giá bán" value={form.salePrice} onChange={(salePrice) => setForm({ ...form, salePrice })} />
          <NumberField label="Giá gốc" value={form.originalPrice} onChange={(originalPrice) => setForm({ ...form, originalPrice })} />
          <NumberField label="Giá nhập" value={form.importPrice} onChange={(importPrice) => setForm({ ...form, importPrice })} />
          <NumberField label="Tồn kho" value={form.stockQuantity} onChange={(stockQuantity) => setForm({ ...form, stockQuantity })} />
        </div>

        <label className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          <span>Cho phép bán gói này</span>
        </label>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {editing && (
            <Button onClick={resetForm}>
              <X size={17} /> Hủy
            </Button>
          )}
          <Button type="submit" variant="accent" disabled={busy || games.length === 0}>
            {editing ? <Save size={17} /> : <Plus size={17} />}
            {editing ? 'Lưu gói' : 'Tạo gói'}
          </Button>
        </div>
      </form>
    </div>
  );
}
