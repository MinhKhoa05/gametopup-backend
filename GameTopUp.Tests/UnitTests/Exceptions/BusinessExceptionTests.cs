using FluentAssertions;
using GameTopUp.BLL.Exceptions;
using Xunit;

namespace GameTopUp.Tests.UnitTests.Exceptions
{
    public class BusinessExceptionTests
    {
        [Fact]
        public void BusinessException_ShouldUseErrorCodeAsMessage_WhenMessageIsNotProvided()
        {
            var exception = new BusinessException(ErrorCodes.EmailExists);

            exception.ErrorCode.Should().Be(ErrorCodes.EmailExists);
            exception.Message.Should().Be(ErrorCodes.EmailExists);
        }

        [Fact]
        public void BusinessException_ShouldKeepErrorCode_WhenCustomMessageIsProvided()
        {
            var exception = new BusinessException(
                ErrorCodes.OrderNotFound,
                "Không tìm thấy đơn hàng #123");

            exception.ErrorCode.Should().Be(ErrorCodes.OrderNotFound);
            exception.Message.Should().Be("Không tìm thấy đơn hàng #123");
        }
    }
}
