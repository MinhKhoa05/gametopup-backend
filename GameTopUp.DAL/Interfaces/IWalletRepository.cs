using GameTopUp.DAL.Entities;

namespace GameTopUp.DAL.Interfaces
{
    public interface IWalletRepository
    {
        Task<Wallet?> GetByUserIdAsync(long userId);
        Task<Wallet?> GetWithLockByUserIdAsync(long userId);
        Task<Wallet> GetWithLockOrThrowAsync(long userId);
        Task CreateAsync(Wallet wallet);
        Task<int> UpdateBalanceAsync(long walletId, decimal newBalance);
    }
}
