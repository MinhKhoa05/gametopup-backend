export type DepositRequestItem = {
  id: number;
  amount: number;
  transferContent: string;
  createdAt: string;
  status: number;
};

export type WalletTransactionItem = {
  id: number;
  type: number;
  description?: string | null;
  createdAt: string;
  amount: number;
  balanceAfter: number;
};
