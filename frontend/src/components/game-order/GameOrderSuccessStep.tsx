import { ArrowRight, BadgeCheck, CheckCircle2, Clock3, Copy, Gift, Gamepad2, Layers3, PackageCheck, UserRound, WalletCards } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../lib/format';
import { useGameOrderStore } from '../../store/game-order.store';

export function GameOrderSuccessStep() {
  const checkoutPackage = useGameOrderStore((state) => state.checkoutPackage);
  const checkoutGameName = useGameOrderStore((state) => state.checkoutGameName);
  const checkoutOrderId = useGameOrderStore((state) => state.checkoutOrderId);
  const checkoutSuccessAt = useGameOrderStore((state) => state.checkoutSuccessAt);
  const checkoutGameAccountInfo = useGameOrderStore((state) => state.checkoutGameAccountInfo);
  const checkoutQuantity = useGameOrderStore((state) => state.checkoutQuantity);
  const resetWizard = useGameOrderStore((state) => state.resetWizard);

  if (!checkoutPackage || !checkoutOrderId || !checkoutGameName) {
    return <EmptyState>Không tìm thấy đơn hàng.</EmptyState>;
  }

  const checkoutSubtotal = checkoutPackage.salePrice * checkoutQuantity;
  const checkoutTotal = checkoutSubtotal;
  const orderCode = `#GTU-${String(checkoutOrderId).padStart(6, '0')}`;
  const successTime = checkoutSuccessAt
    ? new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(checkoutSuccessAt))
    : '--/--/---- - --:--';

  return (
    <div className="grid gap-4">
      <section className="grid min-h-[138px] grid-cols-1 items-center gap-4 rounded-[14px] border border-white/[0.06] bg-[rgba(255,255,255,0.03)] p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-5">
        <div className="grid place-items-center md:w-[132px]">
          <div className="grid h-[78px] w-[78px] place-items-center rounded-[22px] border border-emerald-400/20 bg-gradient-to-b from-emerald-400/15 to-emerald-400/5 text-emerald-400 shadow-[0_0_0_10px_rgba(74,222,128,0.06)]">
            <CheckCircle2 size={36} />
          </div>
        </div>

        <div className="min-w-0">
          <h1 className="m-0 mb-1.5 text-[clamp(1.8rem,2.6vw,2.5rem)] font-black leading-[1.04] tracking-[0.01em] text-emerald-400">Đặt hàng thành công!</h1>
          <p className="m-0 mb-1 text-[0.94rem] font-medium text-slate-200">Đơn hàng của bạn đã được ghi nhận và đang chờ admin xử lý.</p>
          <p className="m-0 text-[0.88rem] leading-[1.45] text-slate-400">Cảm ơn bạn đã tin tưởng lựa chọn GameTopUp. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.</p>
        </div>

        <div className="flex items-center gap-3 md:pr-1" aria-hidden="true">
          <div className="grid place-items-center text-blue-500 drop-shadow-[0_12px_18px_rgba(0,0,0,0.22)]">
            <Gift size={52} />
          </div>
          <div className="grid place-items-center text-sky-400 drop-shadow-[0_12px_18px_rgba(0,0,0,0.22)]">
            <Gamepad2 size={44} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="grid gap-4 rounded-[14px] border border-white/[0.06] bg-[rgba(255,255,255,0.03)] p-5">
          <div className="grid gap-3 rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2.5 min-h-7">
              <div className="grid h-7 w-7 place-items-center rounded-lg border border-cyanline/10 bg-cyanline/8 text-cyanline">
                <Copy size={16} />
              </div>
              <h3 className="m-0 text-[0.82rem] font-bold tracking-[0.13em] text-slate-200">THÔNG TIN ĐƠN HÀNG</h3>
            </div>

            <div className="grid gap-0 overflow-hidden rounded-[12px] border border-white/[0.06] bg-white/[0.02]">
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <Copy size={14} />
                  Mã đơn hàng
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-slate-100">{orderCode}</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <BadgeCheck size={14} />
                  Game
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-white">{checkoutGameName}</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <PackageCheck size={14} />
                  Gói nạp
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-white">{checkoutPackage.name}</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <UserRound size={14} />
                  UID / Server / Tên nhân vật
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-white">{checkoutGameAccountInfo}</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <Layers3 size={14} />
                  Số lượng
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-white">{checkoutQuantity}</strong>
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-[12px] border border-white/[0.06] bg-white/[0.02] p-3.5">
            <div className="flex items-center gap-2.5 min-h-7">
              <div className="grid h-7 w-7 place-items-center rounded-lg border border-sky-400/10 bg-sky-400/8 text-sky-400">
                <WalletCards size={16} />
              </div>
              <h3 className="m-0 text-[0.82rem] font-bold tracking-[0.13em] text-slate-200">THÔNG TIN THANH TOÁN</h3>
            </div>

            <div className="grid gap-0 overflow-hidden rounded-[12px] border border-white/[0.06] bg-white/[0.02]">
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <WalletCards size={14} />
                  Hình thức
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-white">Ví GameTopUp</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <Layers3 size={14} />
                  Tạm tính
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-white">{formatCurrency(checkoutSubtotal)}</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-center gap-3 border-b border-white/[0.06] px-4 py-2.5">
                <span className="inline-flex items-center gap-2 text-[0.8rem] font-medium text-slate-400">
                  <BadgeCheck size={14} />
                  Giảm giá
                </span>
                <strong className="justify-self-end text-right text-[0.96rem] font-semibold text-slate-400">-0 đ</strong>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 px-4 py-3">
                <span className="text-[0.88rem] font-bold text-slate-200">Tổng thanh toán</span>
                <strong className="justify-self-end text-right text-[1.08rem] font-extrabold text-cyanline">{formatCurrency(checkoutTotal)}</strong>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-3.5 rounded-[14px] border border-white/[0.06] bg-[rgba(255,255,255,0.03)] p-5">
          <div>
            <h2 className="m-0 text-[0.82rem] font-bold tracking-[0.13em] text-slate-200">TRẠNG THÁI ĐƠN HÀNG</h2>
          </div>

          <div className="grid gap-4">
            <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-emerald-400/20 bg-emerald-400/12 text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <div className="pt-px">
                <div className="mb-1.5 flex items-center gap-2">
                  <strong className="text-[0.96rem] font-bold text-white">Đã thanh toán</strong>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[0.72rem] font-bold text-emerald-200">Hoàn tất</span>
                </div>
                <p className="m-0 text-[0.84rem] leading-[1.45] text-slate-300">{successTime}</p>
              </div>
            </div>

            <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-cyanline/16 bg-cyanline/10 text-cyan-200">
                <Clock3 size={18} />
              </div>
              <div className="pt-px">
                <div className="mb-1.5 flex items-center gap-2">
                  <strong className="text-[0.96rem] font-bold text-white">Chờ admin xử lý</strong>
                  <span className="rounded-full bg-cyanline/10 px-2.5 py-1 text-[0.72rem] font-bold text-cyan-100">Đang xử lý</span>
                </div>
                <p className="m-0 mb-1 text-[0.84rem] leading-[1.45] text-slate-300">Admin sẽ kiểm tra và nạp trong ít phút.</p>
                <small className="text-[0.75rem] text-slate-400">Ước tính: 1 - 5 phút</small>
              </div>
            </div>

            <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-3.5">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.06] bg-slate-400/8 text-slate-400">
                <PackageCheck size={18} />
              </div>
              <div className="pt-px">
                <div className="mb-1.5 flex items-center gap-2">
                  <strong className="text-[0.96rem] font-bold text-white">Hoàn tất</strong>
                  <span className="rounded-full bg-slate-400/8 px-2.5 py-1 text-[0.72rem] font-bold text-slate-400">Chưa hoàn tất</span>
                </div>
                <p className="m-0 text-[0.84rem] leading-[1.45] text-slate-300">Sẽ thông báo khi nạp thành công.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-[12px] border border-cyanline/8 bg-cyanline/5 px-3.5 py-3 text-[0.84rem] leading-[1.45] text-sky-100">
            <BadgeCheck size={15} />
            <span>Admin sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất. Vui lòng không tạo lại đơn giống nhau.</span>
          </div>

          <button type="button" className="btn-primary w-full" onClick={resetWizard}>
            <ArrowRight size={18} />
            Tạo đơn mới
          </button>
        </aside>
      </div>
    </div>
  );
}
