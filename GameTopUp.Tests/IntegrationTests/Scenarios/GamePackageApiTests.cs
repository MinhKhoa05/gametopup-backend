using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.DAL.Entities;
using Xunit;
using GameTopUp.API;

using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios
{
    [Collection("IntegrationTests")]
    public class GamePackageApiTests : IAsyncLifetime
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;

        public GamePackageApiTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        public async Task InitializeAsync()
        {
            await _factory.ResetDatabaseAsync();
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }

        [Fact]
        public async Task CreatePackage_ShouldReturnCreated_WhenDataIsValid()
        {
            // Arrange
            var admin = await _factory.SeedUserAsync("admin_pack", u => u.Role = UserRole.Admin);
            var game = await _factory.SeedGameAsync("Active Game For Package");
            var createDto = new CreateGamePackageRequest 
            { 
                GameId = game.Id, 
                Name = "Gói 100K", 
                SalePrice = 100000,
                ImportPrice = 70000,
                IsActive = true
            };

            // Act
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/game-packages")
                .WithTestAuth(admin.Id, "Admin")
                .WithJson(createDto);
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var package = await response.ReadDataAsync<GamePackage>();
            package.Should().NotBeNull();
            package!.Name.Should().Be("Gói 100K");
            package.NormalizedName.Should().Be("goi 100k");
        }

        [Fact]
        public async Task GetPackagesByGameId_ShouldReturnOnlyActivePackages()
        {
            // Arrange
            var game = await _factory.SeedGameAsync("Game with many packages");
            
            // Seed 1 active package directly in DB
            await _factory.SeedGamePackageAsync(game.Id, "Active Pack", customize: p => p.IsActive = true);
            
            // Seed 1 inactive package directly in DB
            await _factory.SeedGamePackageAsync(game.Id, "Inactive Pack", customize: p => p.IsActive = false);

            // Act
            var request = new HttpRequestMessage(HttpMethod.Get, $"/api/game-packages/game/{game.Id}");
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var packages = await response.ReadDataAsync<List<GamePackage>>();
            packages.Should().HaveCount(1);
            packages!.All(p => p.IsActive).Should().BeTrue();
            packages.First().Name.Should().Be("Active Pack");
        }

        [Fact]
        public async Task DeletePackage_ShouldPerformHardDelete()
        {
            // Arrange
            var admin = await _factory.SeedUserAsync("admin_del_pack", u => u.Role = UserRole.Admin);
            var game = await _factory.SeedGameAsync("Game for Delete Pack");
            var package = await _factory.SeedGamePackageAsync(game.Id, "To Be Deleted");

            // Act
            var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/game-packages/{package.Id}")
                .WithTestAuth(admin.Id, "Admin");
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            
            // Verify hard delete by trying to get it (Public endpoint)
            var getRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/game-packages/{package.Id}");
            var getResponse = await _client.SendAsync(getRequest);
            getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }
    }
}
