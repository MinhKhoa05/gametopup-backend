using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Entities.Users;
using GameTopUp.Tests.IntegrationTests.Infrastructure;
using GameTopUp.Tests.IntegrationTests.Support;

namespace GameTopUp.Tests.IntegrationTests.Scenarios.Games;

[Collection("Integration")]
public sealed class GamePackageFlowTests : BaseIntegrationTest
{
    public GamePackageFlowTests(CustomWebApplicationFactory factory) : base(factory)
    {
    }

    [DockerFact]
    public async Task GetPackagesByGameId_ShouldReturnOnlyActivePackagesForThatGame()
    {
        var game = await Factory.SeedGameAsync();
        var otherGame = await Factory.SeedGameAsync();
        var activePackage = await Factory.SeedGamePackageAsync(game.Id, salePrice: 100m, stockQuantity: 5, isActive: true);
        await Factory.SeedGamePackageAsync(game.Id, salePrice: 150m, stockQuantity: 2, isActive: false);
        await Factory.SeedGamePackageAsync(otherGame.Id, salePrice: 200m, stockQuantity: 1, isActive: true);

        var response = await Client.GetAsync($"/api/game-packages/game/{game.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.ReadApiResponseAsync<List<GamePackage>>();
        body.Success.Should().BeTrue();
        body.Data.Should().ContainSingle(package => package.Id == activePackage.Id);
    }

    [DockerFact]
    public async Task GetPackageById_ShouldReturnNotFound_WhenPackageDoesNotExist()
    {
        var response = await Client.GetAsync("/api/game-packages/999999");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [DockerFact]
    public async Task AdminShouldCreateUpdateAndDeletePackage()
    {
        var admin = await Factory.SeedAdminAsync();
        var game = await Factory.SeedGameAsync();
        using var client = CreateAuthenticatedClient(admin.Id, admin.DisplayName, admin.Email, admin.Role);

        var createResponse = await client.PostJsonAsync("/api/game-packages", new CreateGamePackageRequest
        {
            Name = "  VIP Pack  ",
            GameId = game.Id,
            SalePrice = 1000m,
            OriginalPrice = 900m,
            ImportPrice = 800m,
            StockQuantity = 3,
            IsActive = true
        });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var createBody = await createResponse.ReadApiResponseAsync<GamePackage>();
        createBody.Data.Should().NotBeNull();
        createBody.Data!.Name.Should().Be("VIP Pack");
        createBody.Data.StockQuantity.Should().Be(3);

        var updateResponse = await client.PutJsonAsync($"/api/game-packages/{createBody.Data.Id}", new UpdateGamePackageRequest
        {
            Name = "  VIP Plus  ",
            StockQuantity = 5,
            IsActive = false
        });

        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var updateBody = await updateResponse.ReadApiResponseAsync<GamePackage>();
        updateBody.Data.Should().NotBeNull();
        updateBody.Data!.Name.Should().Be("VIP Plus");
        updateBody.Data.StockQuantity.Should().Be(5);
        updateBody.Data.IsActive.Should().BeFalse();

        var deleteResponse = await client.DeleteAsync($"/api/game-packages/{createBody.Data.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var getResponse = await Client.GetAsync($"/api/game-packages/{createBody.Data.Id}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [DockerFact]
    public async Task MemberShouldBeForbidden_WhenCreatingUpdatingOrDeletingPackage()
    {
        var member = await Factory.SeedUserAsync(UserRole.Member);
        var game = await Factory.SeedGameAsync();
        var package = await Factory.SeedGamePackageAsync(game.Id, salePrice: 100m, stockQuantity: 1);
        using var client = CreateAuthenticatedClient(member.Id, member.DisplayName, member.Email, member.Role);

        var createResponse = await client.PostJsonAsync("/api/game-packages", new CreateGamePackageRequest
        {
            Name = "Member Pack",
            GameId = game.Id,
            SalePrice = 100m,
            OriginalPrice = 90m,
            ImportPrice = 80m,
            StockQuantity = 1
        });
        createResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var updateResponse = await client.PutJsonAsync($"/api/game-packages/{package.Id}", new UpdateGamePackageRequest
        {
            Name = "Hacked"
        });
        updateResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var deleteResponse = await client.DeleteAsync($"/api/game-packages/{package.Id}");
        deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}
