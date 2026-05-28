using GameTopUp.DAL.Entities;
using GameTopUp.DAL.Interfaces.Orders;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.Exceptions;

namespace GameTopUp.BLL.Services
{
    public class OrderService
    {
        private readonly IOrderRepository _orderRepo;
        private readonly IOrderHistoryRepository _orderHistoryRepo;

        public OrderService(IOrderRepository orderRepo, IOrderHistoryRepository orderHistoryRepo)
        {
            _orderRepo = orderRepo;
            _orderHistoryRepo = orderHistoryRepo;
        }
        
        public async Task<List<Order>> GetOrdersByUserAsync(UserContext context, OrderStatus? status = null)
        {
            return await _orderRepo.GetByUserIdAsync(context.UserId, status);
        }

        public async Task<List<Order>> GetAllOrdersAsync(OrderStatus? status = null)
        {
            return await _orderRepo.GetAllAsync(status);
        }

        public async Task<List<OrderHistory>> GetHistoriesAsync(long orderId)
        {
            return await _orderHistoryRepo.GetByOrderIdAsync(orderId);
        }

        public async Task<Order> GetByIdOrThrowAsync(long orderId)
        {
            return await _orderRepo.GetByIdAsync(orderId)
                ?? throw new NotFoundException(ErrorCodes.OrderNotFound, $"Không tìm thấy đơn hàng #{orderId}");
        }

        public async Task<Order> GetWithLockByIdOrThrowAsync(long orderId)
        {
            // WHY: Pessimistic Lock ngăn chặn trạng thái đơn hàng bị thay đổi đồng thời.
            return await _orderRepo.GetWithLockByIdAsync(orderId)
                ?? throw new NotFoundException(ErrorCodes.OrderNotFound, $"Không tìm thấy đơn hàng #{orderId}");
        }

        public async Task<long> CreateOrderAsync(UserContext context, GamePackage package, int quantity, string gameAccountInfo)
        {
            if (await _orderRepo.HasPendingOrderAsync(context.UserId))
            {
                throw new BusinessException(ErrorCodes.PendingOrderExists);
            }

            var order = Order.CreatePending(context.UserId, package, quantity, gameAccountInfo);

            try
            {
                var newOrderId = await _orderRepo.CreateAsync(order);
                order.Id = newOrderId;

                var history = OrderHistory.Create(
                    newOrderId,
                    order.Status,
                    order.Status,
                    "Đơn hàng được tạo (Chờ thanh toán).",
                    context.UserId);

                await _orderHistoryRepo.CreateAsync(history);

                return newOrderId;
            }
            catch (Exception ex) when (IsDuplicatePendingOrder(ex))
            {
                throw new BusinessException(ErrorCodes.PendingOrderExists);
            }
        }

        public async Task PickOrderAsync(Order order, UserContext admin)
        {
            // WHY: Đảm bảo tính Idempotent cho phép Admin retry nếu mạng lỗi.
            if (order.Status == OrderStatus.Processing && order.AssignTo == admin.UserId)
                return;

            if (order.Status == OrderStatus.Processing)
                throw new BusinessException(ErrorCodes.OrderAlreadyAssigned);

            if (order.Status != OrderStatus.Paid)
                throw new BusinessException(ErrorCodes.OrderMustBePaidToPick);

            var fromStatus = order.Status;

            order.Status = OrderStatus.Processing;
            order.AssignTo = admin.UserId;
            order.AssignAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepo.UpdateAsync(order);

            var history = OrderHistory.Create(
                order.Id,
                fromStatus,
                OrderStatus.Processing,
                $"Admin {admin.Username} tiếp nhận đơn hàng.",
                admin.UserId,
                isAdmin: true);

            await _orderHistoryRepo.CreateAsync(history);
        }

        public async Task CompleteOrderAsync(Order order, UserContext admin)
        {
            // WHY: Cho phép Admin retry an toàn khi mạng chập chờn.
            if (order.Status == OrderStatus.Completed)
                return;

            if (order.Status != OrderStatus.Processing)
                throw new BusinessException(ErrorCodes.OrderStatusInvalidToComplete);

            if (order.AssignTo != admin.UserId)
                throw new BusinessException(ErrorCodes.CannotModifyOthersOrder);

            var fromStatus = order.Status;

            order.Status = OrderStatus.Completed;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepo.UpdateAsync(order);

            var history = OrderHistory.Create(
                order.Id,
                fromStatus,
                OrderStatus.Completed,
                $"Admin {admin.Username} xác nhận hoàn thành.",
                admin.UserId,
                isAdmin: true);

            await _orderHistoryRepo.CreateAsync(history);
        }

        public async Task<OrderStatus?> CancelOrderAsync(Order order, UserContext user, string? reason = null)
        {
            // WHY: Trả về null nếu đơn đã hủy trước đó (Idempotency).
            if (order.Status == OrderStatus.Cancelled) return null;

            if (order.Status == OrderStatus.Completed)
                throw new BusinessException(ErrorCodes.CompletedOrderCannotBeCancelled);

            bool isOwner = order.UserId == user.UserId;
            bool isAssignedAdmin = order.AssignTo == user.UserId;

            if (!isOwner && !isAssignedAdmin)
                throw new ForbiddenException(ErrorCodes.CannotModifyOthersOrder);
            
            if (order.Status == OrderStatus.Processing && order.UserId == user.UserId)
                throw new ForbiddenException(ErrorCodes.ProcessingOrderCannotBeCancelled);

            var oldStatus = order.Status;

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            await _orderRepo.UpdateAsync(order);

            var history = OrderHistory.Create(
                order.Id,
                oldStatus,
                OrderStatus.Cancelled,
                BuildCancelNote(reason),
                user.UserId);

            await _orderHistoryRepo.CreateAsync(history);
            return oldStatus;
        }

        public void ValidateForPayment(Order order, UserContext user)
        {
            if (order.UserId != user.UserId) 
                throw new BusinessException(ErrorCodes.PaymentForbidden);
                
            if (order.Status != OrderStatus.Pending) 
                throw new BusinessException(ErrorCodes.OrderNotPendingPayment);
        }

        public async Task MarkAsPaidAsync(Order order, UserContext user)
        {
            var fromStatus = order.Status; 
            order.Status = OrderStatus.Paid; 
            order.UpdatedAt = DateTime.UtcNow;
            
            await _orderRepo.UpdateAsync(order);

            var history = OrderHistory.Create(
                order.Id,
                fromStatus,
                order.Status,
                "Thanh toán đơn hàng thành công.",
                user.UserId);

            await _orderHistoryRepo.CreateAsync(history);
        }

        private static string BuildCancelNote(string? reason)
        {
            return "H\u1EE7y \u0111\u01A1n h\u00E0ng." +
                   (string.IsNullOrEmpty(reason) ? "" : $" L\u00FD do: {reason}");
        }

        private static bool IsDuplicatePendingOrder(Exception ex)
        {
            return ex.Message.Contains("Duplicate", StringComparison.OrdinalIgnoreCase) ||
                   ex.Message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase);
        }
    }
}
