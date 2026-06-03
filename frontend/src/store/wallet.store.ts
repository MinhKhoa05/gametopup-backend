import { create } from 'zustand';
import type { DepositRequest, WalletInfo, WalletTransaction } from '../types';

/**
 * State ví dùng chung cho toàn bộ ứng dụng.
 */
type WalletStore = {
  wallet: WalletInfo | null;
  walletLoading: boolean;

  depositRequests: DepositRequest[];
  depositRequestsLoading: boolean;

  transactions: WalletTransaction[];
  transactionsLoading: boolean;

  setWallet: (wallet: WalletInfo | null) => void;
  setWalletLoading: (walletLoading: boolean) => void;

  setDepositRequests: (depositRequests: DepositRequest[]) => void;
  setDepositRequestsLoading: (depositRequestsLoading: boolean) => void;

  setTransactions: (transactions: WalletTransaction[]) => void;
  setTransactionsLoading: (transactionsLoading: boolean) => void;
};

export const useWalletStore = create<WalletStore>((set) => ({
  wallet: null,
  walletLoading: false,

  depositRequests: [],
  depositRequestsLoading: false,

  transactions: [],
  transactionsLoading: false,

  setWallet: (wallet) => set({ wallet }),
  setWalletLoading: (walletLoading) => set({ walletLoading }),

  setDepositRequests: (depositRequests) => set({ depositRequests }),
  setDepositRequestsLoading: (depositRequestsLoading) =>
    set({ depositRequestsLoading }),

  setTransactions: (transactions) => set({ transactions }),
  setTransactionsLoading: (transactionsLoading) =>
    set({ transactionsLoading }),
}));