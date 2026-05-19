using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GameTopUp.BLL.DTOs.Auths;
using GameTopUp.BLL.DTOs.Users;
using GameTopUp.BLL.ApplicationServices;
using GameTopUp.BLL.Exceptions;
using GameTopUp.API.Extensions;

namespace GameTopUp.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ApiControllerBase
    {
        private readonly AuthService _auth;
        
        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(CreateUserRequest registerRequest)
        {
            await _auth.RegisterAsync(registerRequest);
            return ApiCreated(null, "Đăng ký tài khoản thành công.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            var loginResponse = await _auth.LoginAsync(loginRequest);

            Response.SetRefreshToken(loginResponse.RefreshToken);

            return ApiOk(loginResponse, "Đăng nhập thành công.");
        }

        [Authorize]
        [HttpPut("password")]
        public async Task<IActionResult> ChangePassword(PasswordChangeRequest passwordChangeRequest)
        {
            await _auth.ChangePasswordAsync(CurrentUser, passwordChangeRequest);
            return ApiOk(null, "Đổi mật khẩu thành công");
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.GetRefreshToken();
            if (string.IsNullOrEmpty(refreshToken))
            {
                throw new BusinessException("Refresh Token không hợp lệ hoặc đã hết hạn.");
            }

            var result = await _auth.RefreshAsync(refreshToken);

            Response.SetRefreshToken(result.RefreshToken);

            return ApiOk(result, "Làm mới token thành công.");
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.GetRefreshToken();
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _auth.LogoutAsync(refreshToken);
            }

            Response.DeleteRefreshToken();

            return ApiOk(null, "Đăng xuất thành công.");
        }
    }
}
