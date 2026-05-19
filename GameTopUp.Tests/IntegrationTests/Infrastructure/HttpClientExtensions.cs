using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

namespace GameTopUp.Tests.IntegrationTests.Infrastructure
{
    /// <summary>
    /// Extension helpers cho HttpRequestMessage để viết test gọn và readable.
    /// </summary>
    public static class HttpRequestExtensions
    {
        /// <summary>
        /// Gắn auth giả lập qua header để bypass JWT trong test.
        /// </summary>
        public static HttpRequestMessage WithTestAuth(
            this HttpRequestMessage request,
            long userId,
            string role,
            string username = "TestUser")
        {
            request.Headers.Add("X-Test-UserId", userId.ToString());
            request.Headers.Add("X-Test-Role", role);
            request.Headers.Add("X-Test-Username", username);
            return request;
        }

        /// <summary>
        /// Gắn JSON body cho request.
        /// </summary>
        public static HttpRequestMessage WithJson(
            this HttpRequestMessage request,
            object body)
        {
            request.Content = JsonContent.Create(body);
            return request;
        }
    }

    /// <summary>
    /// Extension helper cho HttpResponseMessage để đọc API response nhanh.
    /// </summary>
    public static class HttpResponseExtensions
    {
        /// <summary>
        /// Parse toàn bộ response wrapper (check success/message/data).
        /// </summary>
        public static Task<ApiResponseTestWrapper<T>?> ReadAsApiResult<T>(
            this HttpResponseMessage response)
            => response.Content.ReadFromJsonAsync<ApiResponseTestWrapper<T>>();

        /// <summary>
        /// Lấy trực tiếp Data trong response wrapper.
        /// </summary>
        public static async Task<T?> ReadDataAsync<T>(this HttpResponseMessage response)
        {
            var wrapper = await response.ReadAsApiResult<T>();
            return wrapper != null ? wrapper.Data : default;
        }
    }
}