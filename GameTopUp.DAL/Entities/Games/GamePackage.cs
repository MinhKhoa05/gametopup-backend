using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("game_packages")]
    public class GamePackage
    {
        [Key]
        public long Id { get; set; }
        public string Name { get; set; } = null!;
        public string ImageUrl { get; set; } = string.Empty;
        public string? ImagePublicId { get; set; }
        public string NormalizedName { get; set; } = null!;
        public long GameId { get; set; }

        
        public decimal SalePrice { get; set; }
        public decimal OriginalPrice { get; set; }
        public decimal ImportPrice { get; set; }
        
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public GamePackage()
        {
        }

        public static GamePackage Create(
            string name,
            string normalizedName,
            string imageUrl,
            string? imagePublicId,
            long gameId,
            decimal salePrice,
            decimal originalPrice,
            decimal importPrice,
            int stockQuantity,
            bool isActive)
        {
            var now = DateTime.UtcNow;

            return new GamePackage
            {
                Name = name,
                NormalizedName = normalizedName,
                ImageUrl = imageUrl,
                ImagePublicId = imagePublicId,
                GameId = gameId,
                SalePrice = salePrice,
                OriginalPrice = originalPrice,
                ImportPrice = importPrice,
                StockQuantity = stockQuantity,
                IsActive = isActive,
                CreatedAt = now,
                UpdatedAt = now
            };
        }
    }
}
