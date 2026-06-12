namespace GameTopUp.Tests.IntegrationTests.Support;

public static class AuthTestHelpers
{
    public static Task<HttpResponseMessage> LoginAsync(
        this HttpClient client,
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        return client.PostJsonAsync("/api/auth/login", new
        {
            Email = email,
            Password = password
        }, cancellationToken);
    }

    public static IReadOnlyList<string> GetSetCookieHeaders(this HttpResponseMessage response)
    {
        return response.Headers.TryGetValues("Set-Cookie", out var values)
            ? values.ToList()
            : Array.Empty<string>();
    }

    public static string? ExtractCookieValue(this IEnumerable<string> setCookieHeaders, string cookieName)
    {
        var cookie = setCookieHeaders.FirstOrDefault(header =>
            header.StartsWith($"{cookieName}=", StringComparison.OrdinalIgnoreCase));

        if (cookie is null)
        {
            return null;
        }

        var value = cookie.Split(';', 2)[0];
        var index = value.IndexOf('=');
        return index >= 0 ? value[(index + 1)..] : null;
    }

    public static void ReplaceCookieHeader(this HttpClient client, params string[] cookies)
    {
        client.DefaultRequestHeaders.Remove("Cookie");
        client.DefaultRequestHeaders.Add("Cookie", string.Join("; ", cookies));
    }
}
