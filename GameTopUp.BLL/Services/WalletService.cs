using GameTopUp.BLL.Common;
using GameTopUp.BLL.Exceptions;
using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces.Wallets;
using GameTopUp.BLL.DTOs.Wallets;

namespace GameTopUp.BLL.Services
{
    public class WalletService
    {
        private readonly IWalletRepository _walletRepo;
        private readonly IWalletTransactionRepository _walletTxRepo;

        public WalletService(IWalletRepository walletRepo, IWalletTransactionRepository walletTxRepo)
        {
            _walletRepo = walletRepo;
            _walletTxRepo = walletTxRepo;
        }

        // WHY: Repo đã dùng ON DUPLICATE KEY nên an toàn gọi nhiều lần không sợ lỗi tạo trùng.
        public async Task CreateWalletAsync(long userId)
        {
            await _walletRepo.UpsertWalletAsync(new Wallet
            {
                UserId = userId,
                Balance = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        private async Task<TransactionResponseDTO> CreditAsync(
            long userId, 
            decimal amount, 
            WalletTransactionType type, 
            string description, 
            long? orderId = null)
        {
            // WHY: Ví đã được đảm bảo tạo ở bước đăng ký nên chỉ cần lấy và khóa.
            var wallet = await GetWalletWithLockOrThrowAsync(userId);

            if (amount <= 0) throw new BusinessException(ErrorCodes.AmountMustBePositive);

            decimal balanceBefore = wallet.Balance;
            decimal balanceAfter = balanceBefore + amount;

            wallet.Balance = balanceAfter;
            wallet.UpdatedAt = DateTime.UtcNow;

            await _walletRepo.UpdateBalanceAsync(wallet.Id, wallet.Balance);

            var txId = await _walletTxRepo.CreateAsync(new WalletTransaction
            {
                UserId = wallet.UserId,
                Amount = amount,
                BalanceBefore = balanceBefore,
                BalanceAfter = balanceAfter,
                Type = type,
                Description = description,
                OrderId = orderId,
                CreatedAt = DateTime.UtcNow
            });

            return new TransactionResponseDTO { TransactionId = txId };
        }

        private async Task<TransactionResponseDTO> DebitAsync(
            long userId, 
            decimal amount, 
            WalletTransactionType type, 
            string description, 
            long? orderId = null)
        {
            // WHY: Ví đã được đảm bảo tạo ở bước đăng ký nên chỉ cần lấy và khóa.
            var wallet = await GetWalletWithLockOrThrowAsync(userId);

            if (amount <= 0) throw new BusinessException(ErrorCodes.AmountMustBePositive);
            if (wallet.Balance < amount) throw new BusinessException(ErrorCodes.InsufficientWalletBalance);

            decimal balanceBefore = wallet.Balance;
            decimal balanceAfter = balanceBefore - amount;

            wallet.Balance = balanceAfter;
            wallet.UpdatedAt = DateTime.UtcNow;

            await _walletRepo.UpdateBalanceAsync(wallet.Id, wallet.Balance);

            var txId = await _walletTxRepo.CreateAsync(new WalletTransaction
            {
                UserId = wallet.UserId,
                Amount = -amount,
                BalanceBefore = balanceBefore,
                BalanceAfter = balanceAfter,
                Type = type,
                Description = description,
                OrderId = orderId,
                CreatedAt = DateTime.UtcNow
            });

            return new TransactionResponseDTO { TransactionId = txId };
        }

        public async Task PayOrderAsync(Order order)
        {
            await DebitAsync(
                order.UserId, 
                order.Total, 
                WalletTransactionType.PaidOrder, 
                $"Thanh toán đơn hàng #{order.Id}", 
                order.Id);
        }

        public async Task RefundOrderAsync(Order order, string? reason = null)
        {
            var description = $"Hoàn tiền đơn hàng #{order.Id}." + (string.IsNullOrEmpty(reason) ? "" : $" Lý do: {reason}");
            
            await CreditAsync(
                order.UserId, 
                order.Total, 
                WalletTransactionType.Refund, 
                description, 
                order.Id);
        }

        public async Task<TransactionResponseDTO> DepositAsync(long userId, decimal amount)
        {
            return await CreditAsync(userId, amount, WalletTransactionType.Deposit, $"Nạp tiền vào ví: {amount:N0} VNĐ");
        }

        public async Task<TransactionResponseDTO> DepositFromVietQrAsync(long userId, decimal amount, string depositCode)
        {
            return await CreditAsync(
                userId,
                amount,
                WalletTransactionType.Deposit,
                $"Duyệt nạp tiền VietQR #{depositCode}: {amount:N0} VND");
        }

        public async Task<decimal> GetBalanceAsync(UserContext context)
        {
            var wallet = await _walletRepo.GetByUserIdAsync(context.UserId) 
                ?? throw new NotFoundException(ErrorCodes.WalletNotFound);
            return wallet.Balance;
        }

        private async Task<Wallet> GetWalletWithLockOrThrowAsync(long userId)
        {
            return await _walletRepo.GetWithLockByUserIdAsync(userId)
                ?? throw new NotFoundException(ErrorCodes.WalletNotFound);
        }

        public async Task<List<WalletTransaction>> GetTransactionsAsync(UserContext context)
        {
            return await _walletTxRepo.GetByUserIdAsync(context.UserId);
        }
    }
}
