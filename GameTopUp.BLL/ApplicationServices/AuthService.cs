using GameTopUp.BLL.Common;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.Exceptions;
using GameTopUp.BLL.Services;
using GameTopUp.DAL.Entities;

namespace GameTopUp.BLL.ApplicationServices
{
    public class AuthService
    {
        private readonly UserService _user;
        private readonly TokenService _token;
        private readonly PasswordService _password;
        private readonly WalletService _wallet;
        private readonly DatabaseContext _database;

        public AuthService(UserService user, TokenService token, PasswordService password, WalletService wallet, DatabaseContext database)
        {
            _user = user;
            _token = token;
            _password = password;
            _wallet = wallet;
            _database = database;
        }

        public async Task RegisterAsync(CreateUserRequest request)
        {
            _password.Validate(request.Password);
            var hashedPassword = _password.Hash(request.Password);

            await _database.ExecuteInTransactionAsync(async () =>
            {
                // 1. Tạo người dùng
                var userId = await _user.RegisterWithHashedPasswordAsync(request, hashedPassword);
                
                // WHY: Tạo ví trong cùng transaction đăng ký đảm bảo tính toàn vẹn dữ liệu (Stripe-style).
                await _wallet.CreateWalletAsync(userId);
            });
        }

        public async Task<LoginResponseDTO> LoginAsync(LoginRequest request)
        {
            var user = await _user.GetByEmailAsync(request.Email);
            
            if (user == null || !_password.Verify(request.Password, user.PasswordHash))
            {
                throw new BusinessException("Email hoặc mật khẩu không chính xác.");
            }

            var token = _token.GenerateAccessToken(new TokenRequest
            {
                UserId = user.Id,
                Email = user.Email,
                Name = user.Username,
                Role = user.Role.ToString()
            });

            return new LoginResponseDTO { AccessToken = token };
        }

        public async Task ChangePasswordAsync(UserContext context, PasswordChangeRequest request)
        {
            if (request.CurrentPassword == request.NewPassword)
            {
                throw new BusinessException("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
            }
            
            _password.Validate(request.NewPassword);

            var user = await _user.GetProfileAsync(context.UserId);
            if (!_password.Verify(request.CurrentPassword, user.PasswordHash))
            {
                throw new BusinessException("Mật khẩu hiện tại không chính xác.");
            }

            await _user.ChangePasswordAsync(context.UserId, _password.Hash(request.NewPassword));
        }
    }
}
