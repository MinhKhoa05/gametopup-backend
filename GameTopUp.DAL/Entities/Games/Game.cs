using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("games")]
    public class Game
    {
        [Key]
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Game()
        {
        }

        public static Game Create(string name, string imageUrl, bool isActive)
        {
            var now = DateTime.UtcNow;

            return new Game
            {
                Name = name,
                ImageUrl = imageUrl,
                IsActive = isActive,
                CreatedAt = now,
                UpdatedAt = now
            };
        }
    }
}
