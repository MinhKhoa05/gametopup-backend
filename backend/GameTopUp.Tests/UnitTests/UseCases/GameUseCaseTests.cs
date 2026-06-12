using FluentAssertions;
using GameTopUp.BLL.DTOs.Games;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GameTopUp.Tests.UnitTests.UseCases;

public class GameUseCaseTests
{
    private readonly Mock<IGameRepository> _repository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly GameUseCase _useCase;

    public GameUseCaseTests()
    {
        _useCase = new GameUseCase(new GameService(_repository.Object), _imageStorageService.Object);
    }

    [Fact]
    public async Task CreateGameWithImageAsync_ShouldThrow_WhenImageIsMissing()
    {
        var act = async () => await _useCase.CreateGameWithImageAsync(new CreateGameRequest
        {
            Name = "PUBG",
            IsActive = true
        }, new FormFile(Stream.Null, 0, 0, "image", "image.png"));

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.ImageRequired);
    }

    [Fact]
    public async Task CreateGameWithImageAsync_ShouldUploadImageAndPersistGame()
    {
        Game? created = null;
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "games"))
            .ReturnsAsync(new GameTopUp.BLL.DTOs.Images.ImageStorageResult
            {
                Url = "https://cdn.test/games/pubg.png",
                RelativePath = "/games/pubg.png"
            });
        _repository.Setup(repo => repo.CreateAsync(It.IsAny<Game>()))
            .ReturnsAsync(77)
            .Callback<Game>(game => created = game);

        var image = CreateImageFile("pubg.png", new byte[] { 1, 2, 3 });
        var game = await _useCase.CreateGameWithImageAsync(new CreateGameRequest
        {
            Name = "PUBG",
            IsActive = true
        }, image);

        game.Id.Should().Be(77);
        created.Should().NotBeNull();
        created!.ImageUrl.Should().Be("https://cdn.test/games/pubg.png");
        created.ImageRelativePath.Should().Be("/games/pubg.png");
        _imageStorageService.Verify(service => service.UploadAsync(image, "games"), Times.Once);
    }

    [Fact]
    public async Task UpdateGameWithImageAsync_ShouldKeepExistingImage_WhenNoNewImageProvided()
    {
        Game? updated = null;
        _repository.Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Game
            {
                Id = 5,
                Name = "Old",
                ImageUrl = "https://cdn.test/old.png",
                ImageRelativePath = "/games/old.png"
            });
        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ReturnsAsync(true)
            .Callback<Game>(game => updated = game);

        var result = await _useCase.UpdateGameWithImageAsync(5, new UpdateGameRequest
        {
            Name = "New Name"
        }, null);

        result.Name.Should().Be("New Name");
        result.ImageUrl.Should().Be("https://cdn.test/old.png");
        result.ImageRelativePath.Should().Be("/games/old.png");
        _imageStorageService.Verify(service => service.UploadAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
        _imageStorageService.Verify(service => service.DeleteAsync(It.IsAny<string?>()), Times.Never);
        updated.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateGameWithImageAsync_ShouldReplaceImageAndDeleteOldFile()
    {
        _repository.Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Game
            {
                Id = 5,
                Name = "Old",
                ImageUrl = "https://cdn.test/old.png",
                ImageRelativePath = "/games/old.png"
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "games"))
            .ReturnsAsync(new GameTopUp.BLL.DTOs.Images.ImageStorageResult
            {
                Url = "https://cdn.test/new.png",
                RelativePath = "/games/new.png"
            });
        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ReturnsAsync(true);

        var image = CreateImageFile("new.png", new byte[] { 9, 8, 7 });
        await _useCase.UpdateGameWithImageAsync(5, new UpdateGameRequest(), image);

        _imageStorageService.Verify(service => service.UploadAsync(image, "games"), Times.Once);
        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Once);
    }

    [Fact]
    public async Task UpdateGameAsync_ShouldDeleteOldImage_WhenImageUrlChanges()
    {
        _repository.Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Game
            {
                Id = 5,
                Name = "Old",
                ImageUrl = "https://cdn.test/old.png",
                ImageRelativePath = "/games/old.png"
            });
        _repository.Setup(repo => repo.UpdateAsync(It.IsAny<Game>()))
            .ReturnsAsync(true);

        await _useCase.UpdateGameAsync(5, new UpdateGameRequest
        {
            ImageUrl = "https://cdn.test/new.png"
        });

        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Once);
    }

    [Fact]
    public async Task DeleteGameAsync_ShouldDeleteImageAndGame()
    {
        _repository.Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new Game
            {
                Id = 5,
                ImageRelativePath = "/games/old.png"
            });
        _repository.Setup(repo => repo.DeleteAsync(5))
            .ReturnsAsync(1);

        await _useCase.DeleteGameAsync(5);

        _repository.Verify(repo => repo.DeleteAsync(5), Times.Once);
        _imageStorageService.Verify(service => service.DeleteAsync("/games/old.png"), Times.Once);
    }

    private static FormFile CreateImageFile(string fileName, byte[] content)
    {
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, "image", fileName);
    }
}
