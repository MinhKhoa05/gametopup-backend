# PLAN-Testing-TestContainersRefactor

## Objective
Refactor the integration testing infrastructure to use `Testcontainers.MariaDb` instead of SQLite in-memory. This will provide a more realistic test environment that matches the production MariaDB database.

## Created At
2026-05-16T10:55:00+07:00

## Reference Memory
- Confirmed check of `learning.md`, `rules.md`, and `architecture.md`.
- Departing from Rule 15 (SQLite In-Memory) to move towards `TestContainers` as requested.

## File Changes
- **Modify**: `GameTopUp.Tests/GameTopUp.Tests.csproj` (Add Testcontainers.MariaDb and Respawn packages)
- **Modify**: `GameTopUp.Tests/IntegrationTests/CustomWebApplicationFactory.cs` (Replace SQLite with MariaDb container logic)
- **Move & Organize**:
    - `GameTopUp.Tests/IntegrationTests/Infrastructure/`:
        - `CustomWebApplicationFactory.cs`
        - `SharedTestCollection.cs`
        - `TestAuthHandler.cs`
        - `ApiResponseTestWrapper.cs`
    - `GameTopUp.Tests/IntegrationTests/Scenarios/`: (or `Tests/`)
        - `GameApiTests.cs`
        - `GamePackageApiTests.cs`
        - `OrderApiTests.cs`
        - `UserApiTests.cs`

## Implementation Details
1.  **Container Management**: `CustomWebApplicationFactory` will hold a static `MariaDbContainer` using the `mariadb:11` image.
2.  **Lifecycle**: The container will start once (using a static initializer or `Task.Run`) and be reused across all integration test classes to minimize overhead.
3.  **Database Schema**: On container startup, the `Database/schema.sql` will be executed to initialize the MariaDB instance.
4.  **Database Reset (Respawn)**: Implement `ResetDatabaseAsync` using `Respawner.CreateAsync`. It will be configured to ignore the `__EFMigrationsHistory` (if exists) and focus on business tables.
5.  **Service Override**: Use `services.AddDbContext` or equivalent to point to the container's connection string, ensuring `MatchNamesWithUnderscores` is active for Dapper.
6.  **Directory Restructuring**: Clean up the `IntegrationTests` folder by moving infrastructure files to `Infrastructure/` and test scenarios to `Scenarios/`.

## Impact / Risk
- **Impact**: More reliable tests, catching MariaDB-specific issues (e.g., snake_case mapping, specific SQL syntax).
- **Risk**: Increased test execution time due to container startup (mitigated by reusing the container). Requires Docker to be running on the test machine.

Approve this plan? (OK / Reject / Modify)
