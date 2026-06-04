import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../../lib/format';
import type { AdminGamePackage, Game } from '../../types';
import { AdminSkeleton, EmptyLine, NumberField, PanelTitle, SearchBox, StatusPill, filterByName, gameName } from './AdminShared';
import { Field } from '../ui/Field';
import { classNames, pickImage } from '../../lib/ui';

const emptyPackageForm = {
  gameId: 0,
  imageUrl: '',
  importPrice: 0,
  isActive: true,
  name: '',
  originalPrice: 0,
  salePrice: 0,
  stockQuantity: 0,
};

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
  const [editing, setEditing] = useState<AdminGamePackage | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyPackageForm);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (games.length === 0) {
      setSelectedGameId(null);
      return;
    }

    setSelectedGameId((current) => (current && games.some((game) => game.id === current) ? current : games[0].id));
  }, [games]);

  useEffect(() => {
    if (editing) return;

    setForm((current) => ({
      ...current,
      gameId: selectedGameId ?? games[0]?.id ?? 0,
    }));
  }, [editing, games, selectedGameId]);

  const selectedGamePackages = useMemo(() => packages.filter((item) => item.gameId === selectedGameId), [packages, selectedGameId]);
  const scopedPackages = useMemo(() => filterByName(selectedGamePackages, query), [selectedGamePackages, query]);
  const profit = (item: AdminGamePackage) => item.salePrice - item.importPrice;
  const selectedGame = selectedGameId ? games.find((game) => game.id === selectedGameId) ?? null : null;
  const previewSrc = form.imageUrl.trim() || (editing ? pickImage(editing) : selectedGame ? pickImage(selectedGame) : '');

  function startEdit(item: AdminGamePackage) {
    setEditing(item);
    setSelectedGameId(item.gameId);
    setForm({
      gameId: item.gameId,
      imageUrl: item.imageUrl ?? '',
      importPrice: item.importPrice,
      isActive: item.isActive,
      name: item.name,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      stockQuantity: item.stockQuantity,
    });
  }

  function resetForm() {
    setEditing(null);
    setForm({
      ...emptyPackageForm,
      gameId: selectedGameId ?? games[0]?.id ?? 0,
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = {
      ...form,
      gameId: form.gameId || selectedGameId || games[0]?.id || 0,
      imageUrl: form.imageUrl.trim(),
      name: form.name.trim(),
    };
    await (editing
      ? onUpdatePackage({
          id: editing.id,
          imageUrl: payload.imageUrl,
          importPrice: payload.importPrice,
          isActive: payload.isActive,
          name: payload.name,
          originalPrice: payload.originalPrice,
          salePrice: payload.salePrice,
          stockQuantity: payload.stockQuantity,
        })
      : onCreatePackage(payload));
    resetForm();
  }

  async function remove(item: AdminGamePackage) {
    if (!window.confirm(`Xóa gói "${item.name}"?`)) return;
    await onDeletePackage(item.id);
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gametopup-surface grid gap-4">
        <PanelTitle title="Chọn game" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(186px,1fr))] gap-2.5 max-[700px]:grid-cols-[repeat(auto-fit,minmax(152px,1fr))]" role="tablist" aria-label="Chọn game để quản lý gói nạp">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              className={classNames(
                'grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-left text-slate-300 transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px hover:border-cyanline/24 hover:bg-cyanline/10 hover:text-cyan-50 disabled:cursor-not-allowed disabled:opacity-60',
                selectedGameId === game.id && 'border-cyanline/24 bg-cyanline/10 text-cyan-50',
              )}
              disabled={Boolean(editing)}
              onClick={() => {
                setSelectedGameId(game.id);
                if (!editing) setForm((current) => ({ ...current, gameId: game.id }));
              }}
            >
              <img className="h-10 w-10 rounded-xl bg-cyanline/10 object-cover" src={pickImage(game)} alt="" />
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
                    'gametopup-record-row grid-cols-[auto_minmax(0,1fr)_minmax(140px,auto)_auto_auto] max-[700px]:grid-cols-1',
                    isEditing && 'border-cyanline/56 bg-cyanline/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.12)]',
                  )}
                  key={item.id}
                >
                  <img className="h-12 w-12 rounded-xl bg-cyanline/10 object-cover max-[700px]:h-[54px] max-[700px]:w-[54px]" src={pickImage(item)} alt="" />
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
                  <StatusPill active={item.isActive} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-cyanline/30 hover:text-cyan-100"
                      title="Sửa gói"
                      onClick={() => startEdit(item)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-500/8 text-rose-300 transition-colors hover:border-rose-400/30 hover:bg-rose-500/12 hover:text-rose-200"
                      title="Xóa gói"
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form className="gametopup-surface sticky top-24" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật gói nạp' : 'Tạo gói nạp'} />

        <div className="mb-4 grid gap-3">
          <Field label="Tên gói" onChange={(value) => setForm({ ...form, name: value })} placeholder="Nhập tên gói" required value={form.name} />
          <Field label="Ảnh gói" onChange={(value) => setForm({ ...form, imageUrl: value })} placeholder="https://..." value={form.imageUrl} />
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
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X size={17} /> Hủy
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={busy || games.length === 0}>
            {editing ? <Save size={17} /> : <Plus size={17} />}
            {editing ? 'Lưu gói' : 'Tạo gói'}
          </button>
        </div>
      </form>
    </div>
  );
}
