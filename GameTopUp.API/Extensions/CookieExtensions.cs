using Microsoft.AspNetCore.Http;

namespace GameTopUp.API.Extensions
{
    public static class CookieExtensions
    {
        private const string RefreshTokenCookieName = "refreshToken";

        public static void SetRefreshToken(this HttpResponse response, string refreshToken, int expireDays = 7)
        {
            if (response.HasStarted || string.IsNullOrEmpty(refreshToken))
            {
                return;
            }

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(expireDays)
            };

            response.Cookies.Append(RefreshTokenCookieName, refreshToken, cookieOptions);
        }

        public static string? GetRefreshToken(this HttpRequest request)
        {
            return request.Cookies.TryGetValue(RefreshTokenCookieName, out var refreshToken) 
                ? refreshToken 
                : null;
        }

        public static void DeleteRefreshToken(this HttpResponse response)
        {
            if (response.HasStarted)
            {
                return;
            }

            response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax
            });
        }
    }
}
