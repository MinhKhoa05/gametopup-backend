import type { ReactNode } from 'react';
import { Headset, ShieldCheck, Tag, Zap } from 'lucide-react';
import { IconBox } from './IconBox';

export type TrustSectionItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const BENEFITS = [
  {
    title: 'Giá tốt hơn',
    description: 'Tiết kiệm đến 15% so với cửa hàng chính thức.',
    icon: <Tag size={24} />,
  },
  {
    title: 'Thanh toán an toàn',
    description: 'Bảo mật thông tin tuyệt đối, hỗ trợ nhiều phương thức.',
    icon: <ShieldCheck size={24} />,
  },
  {
    title: 'Xử lý nhanh chóng',
    description: 'Đơn được xử lý tự động 5 - 15 phút.',
    icon: <Zap size={24} />,
  },
  {
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn.',
    icon: <Headset size={24} />,
  },
] as const;

export function TrustSection() {
  return (
    <section className="grid gap-5">
      <div className="flex items-end justify-between gap-4">
        <h2 className="m-0 text-[1.5rem] font-black tracking-[-0.03em] text-white sm:text-[1.7rem]">Vì sao chọn GameTopUp?</h2>
      </div>

      <section className="gt-surface overflow-hidden rounded-[18px] border border-white/10 p-0">
        <div className="grid divide-y divide-white/10 xl:grid-cols-4 xl:divide-x xl:divide-y-0">
          {BENEFITS.map((item) => (
            <article key={item.title} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 px-7 py-5">
              <IconBox size="sm" className="h-12 w-12 rounded-[16px] border-cyan/20 bg-cyan/10 text-cyan-50">
                {item.icon}
              </IconBox>
              <div className="grid gap-1">
                <h3 className="text-base font-black text-white">{item.title}</h3>
                <p className="m-0 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
