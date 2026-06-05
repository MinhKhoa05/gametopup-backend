import { Gamepad2, WalletCards, Zap } from 'lucide-react';
import { ActionCard, IconBox } from '../ui';

type HowToTopupSectionProps = {
  hasLogin: boolean;
};

const steps = [
  {
    id: 1,
    title: '1. Chọn game',
    desc: 'Tìm tựa game và chọn gói nạp phù hợp.',
    icon: <Gamepad2 size={24} />,
  },
  {
    id: 2,
    title: '2. Nhập ID',
    desc: 'Cung cấp UID hoặc thông tin tài khoản.',
    icon: <Zap size={24} />,
  },
  {
    id: 3,
    title: '3. Thanh toán',
    desc: 'Sử dụng số dư ví và nhận gói nạp tức thì.',
    icon: <WalletCards size={24} />,
  },
] as const;

export function HowToTopupSection({ hasLogin }: HowToTopupSectionProps) {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-extrabold text-white">Cách Thức Nạp Game</h2>
      <div className={hasLogin ? 'grid gap-4 md:grid-cols-3' : 'grid gap-4'}>
        {steps.map((step) => (
          <ActionCard
            key={step.id}
            centered={!hasLogin}
            icon={
              <IconBox size="md">
                {step.icon}
              </IconBox>
            }
            title={step.title}
            description={step.desc}
          />
        ))}
      </div>
    </div>
  );
}
