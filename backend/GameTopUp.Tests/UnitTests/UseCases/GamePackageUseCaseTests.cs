using FluentAssertions;
using GameTopUp.BLL.DTOs.GamePackages;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Interfaces;
using GameTopUp.BLL.Services.Games;
using GameTopUp.BLL.UseCases;
using GameTopUp.DAL.Entities.Games;
using GameTopUp.DAL.Interfaces.Games;
using Microsoft.AspNetCore.Http;
using Moq;

namespace GameTopUp.Tests.UnitTests.UseCases;

public class GamePackageUseCaseTests
{
    private readonly Mock<IGamePackageRepository> _packageRepository = new();
    private readonly Mock<IGameRepository> _gameRepository = new();
    private readonly Mock<IImageStorageService> _imageStorageService = new();
    private readonly GamePackageUseCase _useCase;

    public GamePackageUseCaseTests()
    {
        _useCase = new GamePackageUseCase(new GamePackageService(_packageRepository.Object, _gameRepository.Object), _imageStorageService.Object);
    }

    [Fact]
    public async Task CreatePackageWithImageAsync_ShouldThrow_WhenImageIsMissing()
    {
        var act = async () => await _useCase.CreatePackageWithImageAsync(new CreateGamePackageRequest
        {
            Name = "VIP",
            GameId = 10,
            SalePrice = 100m,
            OriginalPrice = 90m,
            ImportPrice = 80m
        }, new FormFile(Stream.Null, 0, 0, "image", "image.png"));

        await act.Should().ThrowAsync<BusinessException>()
            .Where(ex => ex.ErrorCode == ErrorCode.ImageRequired);
    }

    [Fact]
    public async Task CreatePackageWithImageAsync_ShouldUploadImageAndPersistPackage()
    {
        GamePackage? created = null;
        _gameRepository.Setup(repo => repo.GetByIdAsync(10))
            .ReturnsAsync(new Game
            {
                Id = 10,
                IsActive = true
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "game-packages"))
            .ReturnsAsync(new GameTopUp.BLL.DTOs.Images.ImageStorageResult
            {
                Url = "https://cdn.test/packages/vip.png",
                RelativePath = "/packages/vip.png"
            });
        _packageRepository.Setup(repo => repo.CreateAsync(It.IsAny<GamePackage>()))
            .ReturnsAsync(77)
            .Callback<GamePackage>(package => created = package);

        var image = CreateImageFile("vip.png", new byte[] { 1, 2, 3 });
        var package = await _useCase.CreatePackageWithImageAsync(new CreateGamePackageRequest
        {
            Name = "VIP",
            GameId = 10,
            SalePrice = 100m,
            OriginalPrice = 90m,
            ImportPrice = 80m
        }, image);

        package.Id.Should().Be(77);
        created.Should().NotBeNull();
        created!.ImageUrl.Should().Be("https://cdn.test/packages/vip.png");
        created.ImageRelativePath.Should().Be("/packages/vip.png");
    }

    [Fact]
    public async Task UpdatePackageWithImageAsync_ShouldKeepExistingImage_WhenNoNewImageProvided()
    {
        _packageRepository.Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                Name = "Old",
                ImageUrl = "https://cdn.test/old.png",
                ImageRelativePath = "/packages/old.png"
            });
        _packageRepository.Setup(repo => repo.UpdateAsync(It.IsAny<GamePackage>()))
            .ReturnsAsync(true);

        var result = await _useCase.UpdatePackageWithImageAsync(5, new UpdateGamePackageRequest
        {
            Name = "New Name"
        }, null);

        result.Name.Should().Be("New Name");
        result.ImageUrl.Should().Be("https://cdn.test/old.png");
        result.ImageRelativePath.Should().Be("/packages/old.png");
        _imageStorageService.Verify(service => service.UploadAsync(It.IsAny<IFormFile>(), It.IsAny<string>()), Times.Never);
        _imageStorageService.Verify(service => service.DeleteAsync(It.IsAny<string?>()), Times.Never);
    }

    [Fact]
    public async Task UpdatePackageWithImageAsync_ShouldReplaceImageAndDeleteOldFile()
    {
        _packageRepository.Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                Name = "Old",
                ImageUrl = "https://cdn.test/old.png",
                ImageRelativePath = "/packages/old.png"
            });
        _imageStorageService.Setup(service => service.UploadAsync(It.IsAny<IFormFile>(), "game-packages"))
            .ReturnsAsync(new GameTopUp.BLL.DTOs.Images.ImageStorageResult
            {
                Url = "https://cdn.test/new.png",
                RelativePath = "/packages/new.png"
            });
        _packageRepository.Setup(repo => repo.UpdateAsync(It.IsAny<GamePackage>()))
            .ReturnsAsync(true);

        var image = CreateImageFile("new.png", new byte[] { 9, 8, 7 });
        await _useCase.UpdatePackageWithImageAsync(5, new UpdateGamePackageRequest(), image);

        _imageStorageService.Verify(service => service.UploadAsync(image, "game-packages"), Times.Once);
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/old.png"), Times.Once);
    }

    [Fact]
    public async Task DeletePackageAsync_ShouldDeleteImageAndPackage()
    {
        _packageRepository.Setup(repo => repo.GetByIdAsync(5))
            .ReturnsAsync(new GamePackage
            {
                Id = 5,
                ImageRelativePath = "/packages/old.png"
            });
        _packageRepository.Setup(repo => repo.DeleteAsync(5))
            .ReturnsAsync(1);

        await _useCase.DeletePackageAsync(5);

        _packageRepository.Verify(repo => repo.DeleteAsync(5), Times.Once);
        _imageStorageService.Verify(service => service.DeleteAsync("/packages/old.png"), Times.Once);
    }

    private static FormFile CreateImageFile(string fileName, byte[] content)
    {
        var stream = new MemoryStream(content);
        return new FormFile(stream, 0, content.Length, "image", fileName);
    }
}
