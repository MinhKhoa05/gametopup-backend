import { FormEvent, useMemo, useState } from 'react';
import { DepositRequest } from '../types';
import {
  useDepositRequestsQuery,
  useTransactionsQuery,
  useWalletQuery,
  useWalletMutations,
} from '../services/wallet';
export type TransactionFilter = 'all' | 'deposit' | 'withdraw' | 'paid' | 'refund';

export type WalletView = 'overview' | 'deposit';

export function useWalletTransactions(isLoggedIn: boolean) {
  const transactionsQuery = useTransactionsQuery(isLoggedIn);

  return {
    transactions: transactionsQuery.data ?? [],
    transactionsLoading: transactionsQuery.isPending && !transactionsQuery.data,
  };
}

export function useWalletDeposit() {
  const [depositAmount, setDepositAmount] = useState(200000);
  const [deposit, setDeposit] = useState<DepositRequest | null>(null);
  const walletMutations = useWalletMutations();

  function handleCreateDeposit(event: FormEvent) {
    event.preventDefault();

    walletMutations.createDeposit.mutate({ amount: depositAmount }, {
      onSuccess: (request) => {
        setDeposit(request);
      },
    });
  }

  function handleConfirmTransfer() {
    if (!deposit) return;

    walletMutations.confirmDeposit.mutate({ requestId: deposit.id }, {
      onSuccess: (request) => {
        setDeposit(request);
      },
    });
  }

  return {
    confirmDepositPending: walletMutations.confirmDeposit.isPending,
    createDepositPending: walletMutations.createDeposit.isPending,
    deposit,
    depositAmount,
    handleConfirmTransfer,
    handleCreateDeposit,
    setDeposit,
    setDepositAmount,
  };
}

export function useDepositRequests(isLoggedIn: boolean) {
  const depositRequestsQuery = useDepositRequestsQuery(isLoggedIn);

  return {
    depositRequests: depositRequestsQuery.data ?? [],
    depositRequestsLoading: depositRequestsQuery.isPending && !depositRequestsQuery.data,
  };
}

export function useWalletPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [view, setView] = useState<WalletView>('overview');
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const walletQuery = useWalletQuery(isLoggedIn);
  const walletTransactions = useWalletTransactions(isLoggedIn);
  const depositRequests = useDepositRequests(isLoggedIn);
  const deposit = useWalletDeposit();
  const filteredTransactions = useMemo(
    () =>
      walletTransactions.transactions.filter((item) => {
        if (filter === 'all') return true;
        if (filter === 'deposit') return item.type === 1;
        if (filter === 'withdraw') return item.type === 2;
        if (filter === 'paid') return item.type === 3;
        if (filter === 'refund') return item.type === 4;
        return true;
      }),
    [filter, walletTransactions.transactions],
  );

  return {
    deposit,
    depositRequests,
    filteredTransactions,
    filter,
    isLoggedIn,
    wallet: walletQuery.data ?? null,
    walletLoading: walletQuery.isPending && !walletQuery.data,
    setFilter,
    setView,
    transactionLoading: walletTransactions.transactionsLoading,
    view,
  };
}
