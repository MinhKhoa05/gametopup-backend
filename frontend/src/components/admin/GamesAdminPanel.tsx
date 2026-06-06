import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { Game } from '../../types';
import { useAdminGamesPanel } from '../../hooks/admin/admin-games.hooks';
import { Badge, Button, EmptyState, Field, FormActions, RecordRow, SearchBar, SectionHeading, ToggleField } from '../ui';
import { pickImage } from '../../lib/ui';
import { AdminSkeleton } from './AdminShared';

export function GamesAdminPanel({
  busy,
  games,
  loading,
  onCreateGame,
  onUpdateGame,
  onDeleteGame,
}: {
  busy: boolean;
  games: Game[];
  loading: boolean;
  onCreateGame: (payload: { name: string; imageUrl: string; isActive: boolean }) => Promise<void>;
  onUpdateGame: (payload: { id: number; name: string; imageUrl: string; isActive: boolean }) => Promise<void>;
  onDeleteGame: (id: number) => Promise<void>;
}) {
  const { editing, filteredGames, form, query, remove, resetForm, setForm, setQuery, startEdit, submit } = useAdminGamesPanel({
    games,
    onCreateGame,
    onDeleteGame,
    onUpdateGame,
  });

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface">
        <SectionHeading title="Danh sách game" />
        <SearchBar className="mb-4" inputClassName="text-sm" value={query} onChange={setQuery} placeholder="Tìm game..." />
        {loading && filteredGames.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredGames.length === 0 ? (
          <EmptyState>Không tìm thấy game phù hợp.</EmptyState>
        ) : (
          <div className="grid gap-2.5">
            {filteredGames.map((game) => (
              <RecordRow className="grid-cols-[auto_minmax(0,1fr)_auto_auto]" key={game.id}>
                <img className="h-12 w-12 rounded-xl bg-cyan/10 object-cover max-[700px]:h-[54px] max-[700px]:w-[54px]" src={pickImage(game)} alt="" />
                <div>
                  <strong>{game.name}</strong>
                  <small>{game.isActive ? 'Đang hiển thị' : 'Đang ẩn'}</small>
                </div>
                <Badge variant={game.isActive ? 'success' : 'default'} icon={game.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                  {game.isActive ? 'Bật' : 'Tắt'}
                </Badge>
                <div className="flex gap-2">
                  <Button size="icon" title="Sửa game" onClick={() => startEdit(game)}>
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    size="icon"
                    title="Xóa game"
                    onClick={() => remove(game)}
                    className="!border-rose-400/15 !bg-rose-500/10 !text-rose-200 hover:!border-rose-300/25 hover:!bg-rose-500/15 hover:!text-rose-100 hover:!shadow-[0_8px_24px_rgba(244,63,94,0.10)]"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </RecordRow>
            ))}
          </div>
        )}
      </div>

      <form className="gt-surface sticky top-24" onSubmit={submit}>
        <SectionHeading title={editing ? 'Cập nhật game' : 'Tạo game'} />
        <Field label="Tên game" onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nhập tên game" required value={form.name} />
        <Field label="Ảnh đại diện" onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." value={form.imageUrl} />
        <ToggleField
          checked={form.isActive}
          label="Hiển thị game trong danh mục"
          onChange={(isActive) => setForm({ ...form, isActive })}
        />
        <FormActions
          disabled={busy}
          onCancel={editing ? resetForm : undefined}
          submitIcon={editing ? <Save size={17} /> : <Plus size={17} />}
          submitLabel={editing ? 'Lưu game' : 'Tạo game'}
        />
      </form>
    </div>
  );
}
