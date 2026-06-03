export type WalletInfo = {
  userId?: number;
  balance: number;
};

export type WalletTransaction = {
  id: number;
  userId: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: number;
  description?: string | null;
  orderId?: number | null;
  createdAt: string;
};

export type DepositRequest = {
  id: number;
  amount: number;
  code: string;
  transferContent: string;
  qrImageUrl: string;
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  status: number;
  createdAt: string;
};
