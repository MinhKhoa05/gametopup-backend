import { CreditCard, Layers3, ShoppingCart, Tag, UserRound, WalletCards } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency } from '../../lib/format';
import { pickImage } from '../../lib/ui';
import type { Route } from '../../lib/routes';
import { useOrderMutations } from '../../services/orders';
import type { Game, User, WalletInfo } from '../../types';
import { useGameOrderStore } from '../../store/game-order.store';

type Props = {
  game: Game;
  user: User | null;
  wallet: WalletInfo | null;
  walletLoading: boolean;
  navigate: (route: Route) => void;
};

export function GameOrderReviewStep({ game, user, wallet, walletLoading, navigate }: Props) {
  const checkoutPackage = useGameOrderStore((state) => state.checkoutPackage);
  const checkoutQuantity = useGameOrderStore((state) => state.checkoutQuantity);
  const checkoutGameAccountInfo = useGameOrderStore((state) => state.checkoutGameAccountInfo);
  const setStep = useGameOrderStore((state) => state.setStep);
  const setCheckoutSuccess = useGameOrderStore((state) => state.setCheckoutSuccess);
  const checkoutTotal = checkoutPackage ? checkoutPackage.salePrice * checkoutQuantity : 0;
  const walletBalance = wallet?.balance ?? 0;
  const shortage = Math.max(0, checkoutTotal - walletBalance);
  const orderMutations = useOrderMutations();

  if (!checkoutPackage) {
    return <EmptyState>Vui lòng hoàn tất thông tin bước trước.</EmptyState>;
  }

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="grid gap-4 rounded-[14px] border border-white/[0.06] bg-[rgba(255,255,255,0.03)] p-5">
        <div className="flex items-center gap-4 border-b border-white/[0.06] pb-4">
          <img className="h-20 w-20 flex-none rounded-[14px] border border-white/[0.06] object-cover" src={pickImage(game)} alt={game.name} />
          <div className="min-w-0">
            <p className="eyebrow">Bước 2</p>
            <h1 className="m-0 mt-1 text-[clamp(1.42rem,2vw,1.92rem)] font-bold leading-[1.05] text-white">Thanh toán</h1>
            <p className="m-0 mt-1 text-[0.92rem] font-semibold text-cyanline">
              Gói nạp: <span>{checkoutPackage.name}</span>
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-white/[0.06]" aria-hidden="true" />

        <div className="grid gap-0">
          <div className="grid min-h-[42px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.06] py-2">
            <span className="inline-flex items-center gap-2 text-[0.79rem] font-medium text-slate-400">
              <UserRound size={14} />
              UID / Server / Tên nhân vật
            </span>
            <strong className="break-words text-right text-[0.96rem] font-semibold text-white">{checkoutGameAccountInfo}</strong>
          </div>
          <div className="grid min-h-[42px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.06] py-2">
            <span className="inline-flex items-center gap-2 text-[0.79rem] font-medium text-slate-400">
              <Layers3 size={14} />
              Số lượng
            </span>
            <strong className="break-words text-right text-[0.96rem] font-semibold text-white">{checkoutQuantity}</strong>
          </div>
          <div className="grid min-h-[42px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2">
            <span className="inline-flex items-center gap-2 text-[0.79rem] font-medium text-slate-400">
              <Tag size={14} />
              Giá gói
            </span>
            <strong className="break-words text-right text-[0.96rem] font-semibold text-white">{formatCurrency(checkoutPackage.salePrice)}</strong>
          </div>
        </div>
        <div className="h-px w-full bg-white/[0.06]" aria-hidden="true" />

        <div className="grid gap-0">
          <div className="flex justify-between gap-3 border-b border-white/[0.06] py-2.5 text-sm text-slate-400">
            <span>Tạm tính</span>
            <strong className="text-right font-bold text-white">{formatCurrency(checkoutTotal)}</strong>
          </div>
          <div className="flex justify-between gap-3 border-b border-white/[0.06] py-2.5 text-sm text-slate-400">
            <span>Giảm giá</span>
            <strong className="text-right font-bold text-slate-400">-0 đ</strong>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5 text-sm font-bold text-white">
            <span>Tổng thanh toán</span>
            <strong className="text-right text-[1.08rem] font-extrabold text-cyanline">{formatCurrency(checkoutTotal)}</strong>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn-outline w-full" onClick={() => setStep(1)}>
            Quay lại
          </button>
          <button
            type="button"
            className="btn-primary w-full"
            onClick={async () => {
              if (shortage > 0) return;

              try {
                const orderId = await orderMutations.place.mutateAsync({
                  gamePackageId: checkoutPackage.id,
                  quantity: checkoutQuantity,
                  gameAccountInfo: checkoutGameAccountInfo,
                });

                await orderMutations.pay.mutateAsync({ orderId });
                setCheckoutSuccess(orderId);
              } catch {
                // Toasts are handled by the shared mutation hooks.
              }
            }}
            disabled={orderMutations.place.isPending || orderMutations.pay.isPending || !user || walletLoading || shortage > 0}
          >
            <ShoppingCart size={19} />
            {walletLoading ? 'Đang tải ví' : shortage > 0 ? 'Thiếu tiền' : 'Thanh toán bằng ví'}
          </button>
        </div>
      </section>

      <aside className="grid gap-4 rounded-[14px] border border-white/[0.06] bg-[rgba(255,255,255,0.03)] p-5">
        <h2 className="m-0 flex items-center gap-2 text-[0.98rem] font-bold text-white">
          <CreditCard size={18} />
          Chọn hình thức thanh toán
        </h2>

        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3.5 rounded-[14px] border border-white/[0.06] bg-[rgba(255,255,255,0.03)] p-3.5">
          <div className="grid h-14 place-items-center rounded-[14px] border border-cyanline/8 bg-cyanline/6 text-cyanline">
            <WalletCards size={28} />
          </div>
          <div className="grid gap-2">
            <p className="m-0 text-[0.92rem] font-bold text-slate-200">Số dư ví của bạn</p>
            <div className="grid gap-0">
              <div className="flex min-h-9 items-center justify-between gap-3 py-1.5">
                <span>Số dư hiện tại</span>
                <strong className="text-right text-[1rem] font-bold text-cyan-100">{formatCurrency(walletBalance)}</strong>
              </div>
              <div className="flex min-h-9 items-center justify-between gap-3 py-1.5">
                <span>Cần thanh toán</span>
                <strong className="text-right text-[1rem] font-bold text-amber-300">{formatCurrency(checkoutTotal)}</strong>
              </div>
              <div className="h-px w-full bg-white/[0.06]" aria-hidden="true" />
              <div className="flex min-h-9 items-center justify-between gap-3 py-1.5 text-rose-300">
                <span>Thiếu</span>
                <strong>{formatCurrency(shortage)}</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" aria-hidden="true" />

        <button
          type="button"
          className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] border border-white/[0.06] bg-[rgba(255,255,255,0.03)] px-4 py-3.5 text-left text-slate-200 transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 hover:border-cyanline/20 hover:bg-[rgba(255,255,255,0.035)]"
          onClick={() => navigate({ name: 'wallet' })}
        >
          <div className="grid h-10 w-10 place-items-center rounded-full bg-cyanline/10 text-cyanline">
            <WalletCards size={18} />
          </div>
          <div className="min-w-0">
            <strong className="block text-[0.95rem] font-bold text-white">Nạp thêm tiền vào ví</strong>
            <span className="mt-1 block text-[0.77rem] leading-[1.35] text-slate-400">Nạp tiền để thanh toán đơn hàng này.</span>
          </div>
          <span className="text-[1rem] leading-none text-slate-500" aria-hidden="true">
            ○
          </span>
        </button>
      </aside>
    </div>
  );
}
