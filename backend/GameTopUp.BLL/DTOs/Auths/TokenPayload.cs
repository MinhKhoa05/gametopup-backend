using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.DTOs.Auths
{
    public class TokenPayload
    {
        public long UserId { get; set; }
        public string? DisplayName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }

        public TokenPayload()
        {
        }

        public static TokenPayload Create(long userId, string? displayName, string? email, UserRole? role)
        {
            return new TokenPayload
            {
                UserId = userId,
                DisplayName = displayName,
                Email = email,
                Role = role.ToString()
            };
        }
    }
}
