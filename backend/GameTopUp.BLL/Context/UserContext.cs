using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.Context
{
    public class UserContext
    {
        public long UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Member;

        public UserContext()
        {
        }

        public UserContext(long userId, string displayName, UserRole role)
        {
            UserId = userId;
            DisplayName = displayName;
            Role = role;
        }
    }
}
