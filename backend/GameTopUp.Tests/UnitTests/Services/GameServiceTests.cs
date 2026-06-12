using FluentAssertions;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services.Games;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using Moq;

namespace GameTopUp.Tests.UnitTests.Services;

public class GameServiceTests
{
    private readonly Mock<IGameRepository> _repository = new();
    private readonly GameService _service;

    public GameServiceTests()
    {
        _service = new GameService(_repository.Object);
    }

    [Fact]
    public async Task GetGameByIdAsync_ShouldThrow_WhenGameMissing()
    {
        _repository.Setup(repo => repo.GetByIdAsync(7)).ReturnsAsync((Game?)null);

        var act = async () => await _service.GetGameByIdAsync(7);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GameNotFound);
    }

    [Fact]
    public async Task CreateGameAsync_ShouldPersistGame()
    {
        Game? created = null;
        _repository.Setup(repo => repo.CreateAsync(It.IsAny<Game>()))
            .ReturnsAsync(15)
            .Callback<Game>(game => created = game);

        var game = await _service.CreateGameAsync(new CreateGameRequest
        {
            Name = "PUBG",
            IsActive = true
        });

        game.Id.Should().Be(15);
        created.Should().NotBeNull();
        created!.Name.Should().Be("PUBG");
        created.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateGameAsync_ShouldTrimNameAndPersistChanges()
    {
        Game? updated = null;
        _repository.Setup(repo => repo.GetByIdAsync(7))
            .ReturnsAsync(new Game
            {
                Id = 7,
                Name = "Old",
                ImageUrl = "old-url",
                ImageRelativePath = "old-path",
                IsActive = true
            });
        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ReturnsAsync(true)
            .Callback<Game>(game => updated = game);

        var game = await _service.UpdateGameAsync(7, new UpdateGameRequest
        {
            Name = "  New Game  ",
            IsActive = false,
            ImageUrl = "new-url",
            ImageRelativePath = "new-path"
        });

        game.Name.Should().Be("New Game");
        game.IsActive.Should().BeFalse();
        game.ImageUrl.Should().Be("new-url");
        game.ImageRelativePath.Should().Be("new-path");
        updated.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteGameAsync_ShouldThrow_WhenGameDoesNotExist()
    {
        _repository.Setup(repo => repo.GetByIdAsync(7)).ReturnsAsync((Game?)null);

        var act = async () => await _service.DeleteGameAsync(7);

        await act.Should().ThrowAsync<NotFoundException>()
            .Where(ex => ex.ErrorCode == ErrorCode.GameNotFound);
    }
}
