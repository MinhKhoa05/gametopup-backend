import type { ReactNode } from 'react';

export type DepositRequestStatus = {
  description: string;
  icon: ReactNode;
  label: string;
  tone: 'pending' | 'reviewing' | 'approved' | 'rejected';
};
