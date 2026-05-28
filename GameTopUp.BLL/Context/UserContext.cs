namespace GameTopUp.BLL.Context
{
    /// <summary>
    /// Ngữ cảnh user hiện tại, gom các thông tin cần truyền giữa các tầng xử lý
    /// thay vì truyền lẻ từng giá trị như userId, username hoặc role.
    /// </summary>
    public class UserContext
    {
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;

        public UserContext()
        {
        }

        public UserContext(long userId, string username, string role)
        {
            UserId = userId;
            Username = username;
            Role = role;
        }
    }
}
