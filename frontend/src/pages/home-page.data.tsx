import { Gamepad2, ShieldCheck, Tag, WalletCards, Zap } from 'lucide-react';

export const HOME_FEATURES = [
  {
    title: 'Xử Lý Nhanh Chóng',
    desc: 'Hoàn thành trong 5-15 phút',
    icon: <Zap size={32} className="text-cyan" />,
  },
  {
    title: 'Giao Dịch Đảm Bảo',
    desc: 'Uy tín 100%',
    icon: <ShieldCheck size={32} className="text-cyan" />,
  },
  {
    title: 'Giá Rẻ Hơn',
    desc: 'Rẻ hơn tới 15% so với web gốc',
    icon: <WalletCards size={32} className="text-cyan" />,
  },
] as const;

export const HOME_STEPS = [
  {
    title: '1. Chọn game',
    desc: 'Tìm tựa game và chọn gói nạp phù hợp.',
    icon: <Gamepad2 size={24} />,
  },
  {
    title: '2. Nhập ID',
    desc: 'Cung cấp UID hoặc thông tin tài khoản.',
    icon: <Tag size={24} />,
  },
  {
    title: '3. Thanh toán',
    desc: 'Sử dụng số dư ví và nhận gói nạp tức thì.',
    icon: <WalletCards size={24} />,
  },
] as const;

export const homeHeroClassName =
  'relative mb-10 overflow-hidden rounded-3xl border border-white/5 bg-[linear-gradient(100deg,rgba(7,17,31,0.94)_0%,rgba(7,17,31,0.82)_44%,rgba(7,17,31,0.46)_100%),url("https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1600&q=80")] bg-cover px-4 py-6 sm:rounded-[24px] sm:px-6 sm:py-10 lg:px-10 lg:py-16';
