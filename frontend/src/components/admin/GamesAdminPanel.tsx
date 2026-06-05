import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { Game } from '../../types';
import { AdminSkeleton, EmptyLine, PanelTitle, SearchBox, filterByName } from './AdminShared';
import { Badge, Button, Field } from '../ui';
import { pickImage } from '../../lib/ui';

const emptyGameForm = {
  imageUrl: '',
  isActive: true,
  name: '',
};

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
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyGameForm);
  const [query, setQuery] = useState('');
  const filteredGames = useMemo(() => filterByName(games, query), [games, query]);

  function startEdit(game: Game) {
    setEditing(game);
    setForm({ imageUrl: game.imageUrl ?? '', isActive: game.isActive, name: game.name });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyGameForm);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, name: form.name.trim(), imageUrl: form.imageUrl.trim() };
    await (editing ? onUpdateGame({ id: editing.id, ...payload }) : onCreateGame(payload));
    resetForm();
  }

  async function remove(game: Game) {
    if (!window.confirm(`Xóa game "${game.name}"?`)) return;
    await onDeleteGame(game.id);
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface">
        <PanelTitle title="Danh sách game" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm game..." />
        {loading && filteredGames.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredGames.length === 0 ? (
          <EmptyLine text="Không tìm thấy game phù hợp." />
        ) : (
          <div className="grid gap-2.5">
            {filteredGames.map((game) => (
              <div className="gt-record-row grid-cols-[auto_minmax(0,1fr)_auto_auto] max-[700px]:grid-cols-1" key={game.id}>
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
                  <Button size="icon" title="Xóa game" onClick={() => remove(game)} className="!border-rose-400/15 !bg-rose-500/10 !text-rose-200 hover:!border-rose-300/25 hover:!bg-rose-500/15 hover:!text-rose-100 hover:!shadow-[0_8px_24px_rgba(244,63,94,0.10)]">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="gt-surface sticky top-24" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật game' : 'Tạo game'} />
        <Field label="Tên game" onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nhập tên game" required value={form.name} />
        <Field label="Ảnh đại diện" onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://..." value={form.imageUrl} />
        <label className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          <span>Hiển thị game trong danh mục</span>
        </label>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {editing && (
            <Button onClick={resetForm}>
              <X size={17} /> Hủy
            </Button>
          )}
          <Button type="submit" variant="accent" disabled={busy}>
            {editing ? <Save size={17} /> : <Plus size={17} />}
            {editing ? 'Lưu game' : 'Tạo game'}
          </Button>
        </div>
      </form>
    </div>
  );
}
