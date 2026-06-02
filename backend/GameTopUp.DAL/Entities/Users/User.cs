using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GameTopUp.DAL.Entities
{
    [Table("users")]
    public class User
    {
        [Key]
        public long Id { get; set; }

        public string DisplayName { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public UserRole Role { get; set; } = UserRole.Member;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public User()
        {
        }

        public static User Create(string displayName, string email, string passwordHash, UserRole role = UserRole.Member)
        {
            var now = DateTime.UtcNow;

            return new User
            {
                DisplayName = displayName,
                Email = email,
                PasswordHash = passwordHash,
                Role = role,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };
        }
    }

    public enum UserRole
    {
        Member = 0,
        Admin = 1,
        Staff = 2
    }
}
