using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Auth;

[Collection("Integration")]
public sealed class AuthSessionTests : BaseIntegrationTest
{
    public AuthSessionTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task Refresh_ShouldRotateRefreshToken_AndLogoutShouldInvalidateSessionCookies()
    {
        var email = $"refresh-{TestDatabaseExtensions.UniqueCode()}@test.local";
        const string password = "Password123!";

        var registerResponse = await Client.PostJsonAsync("/api/auth/register", new CreateUserRequest
        {
            DisplayName = "Session User",
            Email = email,
            Password = password
        });
        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var loginResponse = await Client.LoginAsync(email, password);
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginCookies = loginResponse.GetSetCookieHeaders();
        var refreshToken = loginCookies.ExtractCookieValue("refreshToken");
        var accessToken = loginCookies.ExtractCookieValue("accessToken");
        refreshToken.Should().NotBeNullOrWhiteSpace();
        accessToken.Should().NotBeNullOrWhiteSpace();

        using var sessionClient = CreateAuthenticatedClient(1, "Session User", email, GameTopUp.DAL.Entities.Users.UserRole.Member);
        sessionClient.ReplaceCookieHeader($"accessToken={accessToken}", $"refreshToken={refreshToken}");

        var refreshResponse = await sessionClient.PostAsync("/api/auth/refresh", null);
        refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var refreshCookies = refreshResponse.GetSetCookieHeaders();
        var rotatedRefreshToken = refreshCookies.ExtractCookieValue("refreshToken");
        var rotatedAccessToken = refreshCookies.ExtractCookieValue("accessToken");
        rotatedRefreshToken.Should().NotBeNullOrWhiteSpace();
        rotatedAccessToken.Should().NotBeNullOrWhiteSpace();
        rotatedRefreshToken.Should().NotBe(refreshToken);
        rotatedAccessToken.Should().NotBe(accessToken);

        sessionClient.ReplaceCookieHeader($"accessToken={rotatedAccessToken}", $"refreshToken={rotatedRefreshToken}");

        var reusedOldTokenClient = Factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
        reusedOldTokenClient.ReplaceCookieHeader($"refreshToken={refreshToken}");
        var reusedRefreshResponse = await reusedOldTokenClient.PostAsync("/api/auth/refresh", null);
        reusedRefreshResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        var logoutResponse = await sessionClient.PostAsync("/api/auth/logout", null);
        logoutResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var logoutCookies = logoutResponse.GetSetCookieHeaders();
        logoutCookies.Should().Contain(cookie => cookie.Contains("accessToken=", StringComparison.OrdinalIgnoreCase) && cookie.Contains("expires=", StringComparison.OrdinalIgnoreCase));
        logoutCookies.Should().Contain(cookie => cookie.Contains("refreshToken=", StringComparison.OrdinalIgnoreCase) && cookie.Contains("expires=", StringComparison.OrdinalIgnoreCase));
    }

    [DockerFact]
    public async Task Refresh_ShouldReturnUnauthorized_WhenRefreshCookieIsMissing()
    {
        var response = await Client.PostAsync("/api/auth/refresh", null);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
