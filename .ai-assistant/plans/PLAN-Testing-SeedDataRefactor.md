# Plan: Refactor Integration Test Seed Data Logic

## 1. Objective
Refactor the seed data helpers (e.g., `SeedUser`, `SeedWallet`, `SeedGame`, `SeedGamePackage`, `SeedOrder`) currently copied/localized in various Integration Test Scenario classes (like `OrderApiTests.cs` and `UserApiTests.cs`) into a centralized, reusable extension class `TestDatabaseSeederExtensions.cs` inside the integration testing infrastructure.

Ensure the seeding APIs are extremely simple, elegant, and flexible using `Action<T>` delegate parameter configurations (e.g., `SeedUserAsync(username, email, u => u.IsActive = false)`).

---

## 2. Metadata
- **Created At**: 2026-05-19T13:35:00+07:00
- **Reference Memory**: Verified compliance with `.ai-assistant/context/rules.md` (Specifically testing standards and naming guidelines), `learning.md`, and `architecture.md`.

---

## 3. Architecture & Design

### 3.1. Reusable Extension Design
Create `TestDatabaseSeederExtensions` as a static extension class on `CustomWebApplicationFactory<Program>` in `GameTopUp.Tests.IntegrationTests.Infrastructure`.
This grants direct access to the `Services` container of the test host, allowing it to easily resolve `DatabaseContext` and use Dapper for clean, reliable data seeding.

### 3.2. Flexible Lambda Configuration Style
Each helper method will accept an optional `Action<T>? customize = null` callback:
```csharp
public static async Task<long> SeedUserAsync(
    this CustomWebApplicationFactory<Program> factory, 
    string username, 
    string email, 
    Action<User>? customize = null)
{
    var user = new User
    {
        Username = username,
        Email = email,
        PasswordHash = "hashed_pass",
        IsActive = true,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    customize?.Invoke(user);

    // Perform database insertion and return the generated ID
}
```
This design allows:
- **Default usage**: `await _factory.SeedUserAsync("username", "email@test.com")`
- **Customized usage**: `await _factory.SeedUserAsync("username", "email@test.com", u => u.IsActive = false)`

---

## 4. Scope & File Changes

### 4.1. Create `GameTopUp.Tests/IntegrationTests/Infrastructure/TestDatabaseSeederExtensions.cs`
Implement static extension methods on `CustomWebApplicationFactory<Program>` for all core seeding and query needs:
- `SeedUserAsync(string username, string email, Action<User>? customize = null)`
- `SeedWalletAsync(long userId, decimal balance, Action<Wallet>? customize = null)`
- `SeedGameAsync(string name, Action<Game>? customize = null)`
- `SeedGamePackageAsync(long gameId, string name, decimal price, Action<GamePackage>? customize = null)`
- `SeedOrderAsync(long userId, long packageId, decimal price, OrderStatus status, Action<Order>? customize = null)`
- `GetOrderFromDbAsync(long id)`
- `GetWalletBalanceAsync(long userId)`
- `GetOrderHistoryCountAsync(long orderId)`
- `UpdatePackageStockAsync(long packageId, int stock)`
- `UpdatePackageStatusAsync(long packageId, bool isActive)`
- `GetPackageStockAsync(long packageId)`
- `GetUserFromDbAsync(long id)`

### 4.2. Modify `GameTopUp.Tests/IntegrationTests/Scenarios/OrderApiTests.cs`
- Remove all local copies of seeding and query helper methods: `SeedUserAsync`, `SeedWalletAsync`, `SeedGameAsync`, `SeedGamePackageAsync`, `SeedOrderAsync`, `GetOrderFromDbAsync`, `GetWalletBalanceAsync`, `GetOrderHistoryCountAsync`, `UpdatePackageStockAsync`, `UpdatePackageStatusAsync`, `GetPackageStockAsync`.
- Refactor all calls in test cases to invoke these extensions on `_factory` (e.g. `await _factory.GetOrderFromDbAsync(...)`).

### 4.3. Modify `GameTopUp.Tests/IntegrationTests/Scenarios/UserApiTests.cs`
- Remove the local copies of `SeedUserAsync` and `GetUserFromDbAsync`.
- Refactor calls to invoke `_factory.SeedUserAsync(...)` and `_factory.GetUserFromDbAsync(...)`.

---

## 5. Impact & Risks
- **Low Risk**: This is purely a refactoring of test infrastructure helper methods.
- **Improved Maintainability**: Completely cleanses scenario test classes from any database connection and query access logic, placing it entirely inside `TestDatabaseSeederExtensions`.

---

> Approve this plan? (OK / Reject / Modify)
