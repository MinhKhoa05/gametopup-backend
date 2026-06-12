using FluentAssertions;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Auth;

namespace GameTopUp.Tests.UnitTests.Services;

public class PasswordServiceTests
{
    private readonly PasswordService _service = new();

    [Fact]
    public void Validate_ShouldThrow_WhenPasswordIsWeak()
    {
        var act = () => _service.Validate("weakpass");

        act.Should().Throw<BusinessException>()
            .Which.ErrorCode.Should().Be(ErrorCode.WeakPassword);
    }

    [Fact]
    public void Validate_ShouldPass_WhenPasswordIsStrong()
    {
        var act = () => _service.Validate("StrongPass1!");

        act.Should().NotThrow();
    }

    [Fact]
    public void Hash_And_Verify_ShouldRoundTrip()
    {
        var hash = _service.Hash("StrongPass1!");

        hash.Should().NotBeNullOrWhiteSpace();
        _service.Verify("StrongPass1!", hash).Should().BeTrue();
    }

    [Theory]
    [InlineData("short1!")]
    [InlineData("nouppercase1!")]
    [InlineData("NOLOWERCASE1!")]
    [InlineData("NoNumber!")]
    [InlineData("NoSpecial123")]
    public void Validate_ShouldReject_CommonWeakPasswordForms(string password)
    {
        var act = () => _service.Validate(password);

        act.Should().Throw<BusinessException>()
            .Which.ErrorCode.Should().Be(ErrorCode.WeakPassword);
    }
}
