using System.Net;
using FluentAssertions;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.DAL.Entities;
using Xunit;
using GameTopUp.API;

using GameTopUp.Tests.IntegrationTests.Infrastructure;

namespace GameTopUp.Tests.IntegrationTests.Scenarios
{
    [Collection("IntegrationTests")]
    public class GameApiTests : IAsyncLifetime
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;

        public GameApiTests(CustomWebApplicationFactory<Program> factory)
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
        public async Task GetAllGames_ShouldReturnWrappedOk()
        {
            // Act
            var request = new HttpRequestMessage(HttpMethod.Get, "/api/games");
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var games = await response.ReadDataAsync<List<Game>>();
            games.Should().NotBeNull();
        }

        [Fact]
        public async Task GetGameById_ShouldReturnNotFound_WhenIdDoesNotExist()
        {
            // Act
            var request = new HttpRequestMessage(HttpMethod.Get, "/api/games/9999");
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
            var wrapper = await response.ReadAsApiResult<object>();
            wrapper!.Success.Should().BeFalse();
            wrapper.Message.Should().Be("Game không tồn tại.");
        }

        [Fact]
        public async Task CreateGame_ShouldReturnCreated_WithCorrectData()
        {
            // Arrange
            var admin = await _factory.SeedUserAsync("admin_game", u => u.Role = UserRole.Admin);
            var createDto = new CreateGameRequest 
            { 
                Name = "Genshin Impact", 
                ImageUrl = "genshin.png",
                IsActive = true
            };

            // Act
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/games")
                .WithTestAuth(admin.Id, "Admin")
                .WithJson(createDto);
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var game = await response.ReadDataAsync<Game>();
            game.Should().NotBeNull();
            game!.Name.Should().Be("Genshin Impact");
            game.ImageUrl.Should().Be("genshin.png");
            game.IsActive.Should().BeTrue();
        }

        [Fact]
        public async Task DeleteGame_ShouldPerformHardDelete_Successfully()
        {
            // Arrange - Create a game first
            var admin = await _factory.SeedUserAsync("admin_del_game", u => u.Role = UserRole.Admin);
            var createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/games")
                .WithTestAuth(admin.Id, "Admin")
                .WithJson(new CreateGameRequest { Name = "Hard Delete Test" });
            var createResponse = await _client.SendAsync(createRequest);
            var game = await createResponse.ReadDataAsync<Game>();
            var gameId = game!.Id;
            
            // Act - Delete it
            var request = new HttpRequestMessage(HttpMethod.Delete, $"/api/games/{gameId}")
                .WithTestAuth(admin.Id, "Admin");
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var wrapper = await response.ReadAsApiResult<object>();
            wrapper!.Success.Should().BeTrue();
            wrapper.Message.Should().Contain("Xóa Game thành công");

            // Verify it's really gone
            var getRequest = new HttpRequestMessage(HttpMethod.Get, $"/api/games/{gameId}");
            var getResponse = await _client.SendAsync(getRequest);
            getResponse.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateGame_ShouldReturnBadRequest_WhenNameIsEmpty()
        {
            // Arrange
            var admin = await _factory.SeedUserAsync("admin_bad_game", u => u.Role = UserRole.Admin);
            var createDto = new CreateGameRequest { Name = "", ImageUrl = "img.png" };

            // Act
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/games")
                .WithTestAuth(admin.Id, "Admin")
                .WithJson(createDto);
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task CreateGame_ShouldHandleSpecialCharactersAndLongStrings()
        {
            // Arrange
            var admin = await _factory.SeedUserAsync("admin_special_game", u => u.Role = UserRole.Admin);
            var longName = new string('A', 100); 
            var specialChars = "!@#$%^&*()_+";
            var createDto = new CreateGameRequest { Name = specialChars + longName, ImageUrl = "img.png" };

            // Act
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/games")
                .WithTestAuth(admin.Id, "Admin")
                .WithJson(createDto);
            var response = await _client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var game = await response.ReadDataAsync<Game>();
            game!.Name.Should().Be(specialChars + longName);
        }
    }
}
