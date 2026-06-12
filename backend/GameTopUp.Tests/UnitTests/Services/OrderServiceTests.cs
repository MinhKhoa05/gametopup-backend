using FluentAssertions;
using GameTopUp.BLL.Context;
using GameTopUp.BLL.DTOs.Orders;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Orders;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.DAL.Interfaces.Orders;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepository = new();
    private readonly Mock<IOrderHistoryRepository> _historyRepository = new();
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        _service = new OrderService(_orderRepository.Object, _historyRepository.Object);
    }

    [Fact]
    public async Task CreateOrderAsync_ShouldPersistPendingOrderAndHistory()
    {
        Order? createdOrder = null;
        OrderHistory? createdHistory = null;
        _orderRepository.Setup(repo => repo.CreateAsync(It.IsAny<Order>()))
            .ReturnsAsync(88)
            .Callback<Order>(order => createdOrder = order);
        _historyRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);

        var package = new GamePackage
        {
            Id = 44,
            SalePrice = 199m
        };

        var orderId = await _service.CreateOrderAsync(new UserContext { UserId = 7 }, package, "  hero-123  ");

        orderId.Should().Be(88);
        createdOrder.Should().NotBeNull();
        createdOrder!.UserId.Should().Be(7);
        createdOrder.GamePackageId.Should().Be(44);
        createdOrder.UnitPrice.Should().Be(199m);
        createdOrder.GameAccountInfo.Should().Be("  hero-123  ");
        createdOrder.Status.Should().Be(OrderStatus.Pending);
        createdOrder.Id.Should().Be(88);
        createdHistory.Should().NotBeNull();
        createdHistory!.OrderId.Should().Be(88);
        createdHistory.FromStatus.Should().Be(OrderStatus.Pending);
        createdHistory.ToStatus.Should().Be(OrderStatus.Pending);
        createdHistory.ActionBy.Should().Be(7);
        createdHistory.Note.Should().Be("Order created in pending state.");
        createdHistory.IsAdmin.Should().BeFalse();
    }

    [Fact]
    public async Task PickOrderAsync_ShouldMovePendingOrderToProcessing()
    {
        Order? updatedOrder = null;
        OrderHistory? createdHistory = null;
        var order = Order.Create(7, 44, 199m, "account");
        order.Id = 88;
        _orderRepository.Setup(repo => repo.UpdateAsync(It.IsAny<Order>()))
            .ReturnsAsync(true)
            .Callback<Order>(value => updatedOrder = value);
        _historyRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);

        var result = await _service.PickOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        result.Changed.Should().BeTrue();
        result.FromStatus.Should().Be(OrderStatus.Pending);
        result.Order.Status.Should().Be(OrderStatus.Processing);
        result.Order.AssignedTo.Should().Be(3);
        result.Order.AssignedAt.Should().NotBeNull();
        updatedOrder.Should().NotBeNull();
        createdHistory.Should().NotBeNull();
        createdHistory!.FromStatus.Should().Be(OrderStatus.Pending);
        createdHistory.ToStatus.Should().Be(OrderStatus.Processing);
        createdHistory.ActionBy.Should().Be(3);
        createdHistory.IsAdmin.Should().BeTrue();
    }

    [Fact]
    public async Task PickOrderAsync_ShouldBeIdempotent_WhenSameAdminReprocessesAnAssignedOrder()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;
        order.AssignedAt = DateTime.UtcNow.AddMinutes(-5);

        var result = await _service.PickOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        result.Changed.Should().BeFalse();
        result.FromStatus.Should().BeNull();
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _historyRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
    }

    [Fact]
    public async Task PickOrderAsync_ShouldThrow_WhenProcessingOrderIsAlreadyAssignedToAnotherAdmin()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        var act = async () => await _service.PickOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderAlreadyAssigned);
    }

    [Fact]
    public async Task PickOrderAsync_ShouldThrow_WhenOrderIsNotPendingOrProcessing()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Completed);
        order.Id = 88;

        var act = async () => await _service.PickOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderNotReadyForPick);
    }

    [Fact]
    public async Task CompleteOrderAsync_ShouldCompleteOrderAssignedToCurrentAdmin()
    {
        Order? updatedOrder = null;
        OrderHistory? createdHistory = null;
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;
        _orderRepository.Setup(repo => repo.UpdateAsync(It.IsAny<Order>()))
            .ReturnsAsync(true)
            .Callback<Order>(value => updatedOrder = value);
        _historyRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);

        var result = await _service.CompleteOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        result.Changed.Should().BeTrue();
        result.FromStatus.Should().Be(OrderStatus.Processing);
        result.Order.Status.Should().Be(OrderStatus.Completed);
        updatedOrder.Should().NotBeNull();
        createdHistory.Should().NotBeNull();
        createdHistory!.FromStatus.Should().Be(OrderStatus.Processing);
        createdHistory.ToStatus.Should().Be(OrderStatus.Completed);
    }

    [Fact]
    public async Task CompleteOrderAsync_ShouldBeIdempotent_WhenOrderIsAlreadyCompleted()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Completed);
        order.Id = 88;
        order.AssignedTo = 3;

        var result = await _service.CompleteOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        result.Changed.Should().BeFalse();
        result.FromStatus.Should().BeNull();
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _historyRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
    }

    [Fact]
    public async Task CompleteOrderAsync_ShouldThrow_WhenOrderIsAssignedToAnotherAdmin()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        var act = async () => await _service.CompleteOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CannotModifyOthersOrder);
    }

    [Fact]
    public async Task CompleteOrderAsync_ShouldThrow_WhenOrderIsNotProcessing()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Pending);
        order.Id = 88;

        var act = async () => await _service.CompleteOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderStatusInvalidToComplete);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldAllowMemberToCancelPendingOrderAndRecordReason()
    {
        Order? updatedOrder = null;
        OrderHistory? createdHistory = null;
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Pending);
        order.Id = 88;
        _orderRepository.Setup(repo => repo.UpdateAsync(It.IsAny<Order>()))
            .ReturnsAsync(true)
            .Callback<Order>(value => updatedOrder = value);
        _historyRepository.Setup(repo => repo.CreateAsync(It.IsAny<OrderHistory>()))
            .ReturnsAsync(12)
            .Callback<OrderHistory>(history => createdHistory = history);

        var result = await _service.CancelOrderAsync(order, new UserContext { UserId = 7 }, "change of plans");

        result.Changed.Should().BeTrue();
        result.FromStatus.Should().Be(OrderStatus.Pending);
        result.Order.Status.Should().Be(OrderStatus.Cancelled);
        updatedOrder.Should().NotBeNull();
        createdHistory.Should().NotBeNull();
        createdHistory!.Note.Should().Be("Order cancelled. Reason: change of plans");
        createdHistory.IsAdmin.Should().BeFalse();
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldThrow_WhenMemberTriesToCancelProcessingOrder()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 3;

        var act = async () => await _service.CancelOrderAsync(order, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.ProcessingOrderCannotBeCancelled);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldThrow_WhenCompletedOrderIsCancelled()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Completed);
        order.Id = 88;
        order.AssignedTo = 3;

        var act = async () => await _service.CancelOrderAsync(order, new UserContext { UserId = 7 });

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CompletedOrderCannotBeCancelled);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldThrow_WhenAdminTriesToCancelSomeoneElsesProcessingOrder()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Processing);
        order.Id = 88;
        order.AssignedTo = 99;

        var act = async () => await _service.CancelOrderAsync(order, new UserContext
        {
            UserId = 3,
            DisplayName = "Admin",
            Role = UserRole.Admin
        });

        await act.Should().ThrowAsync<ForbiddenException>()
            .Where(ex => ex.ErrorCode == ErrorCode.CannotModifyOthersOrder);
    }

    [Fact]
    public async Task GetByIdOrThrowAsync_ShouldThrow_WhenOrderDoesNotExist()
    {
        _orderRepository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync((Order?)null);

        var act = async () => await _service.GetByIdOrThrowAsync(7);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.OrderNotFound);
    }

    [Fact]
    public async Task CancelOrderAsync_ShouldBeIdempotent_WhenOrderIsAlreadyCancelled()
    {
        var order = Order.Create(7, 44, 199m, "account", OrderStatus.Cancelled);
        order.Id = 88;

        var result = await _service.CancelOrderAsync(order, new UserContext { UserId = 7 });

        result.Changed.Should().BeFalse();
        result.FromStatus.Should().BeNull();
        _orderRepository.Verify(repo => repo.UpdateAsync(It.IsAny<Order>()), Times.Never);
        _historyRepository.Verify(repo => repo.CreateAsync(It.IsAny<OrderHistory>()), Times.Never);
    }
}
