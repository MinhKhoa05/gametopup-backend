# Learning Log

Tài liệu này lưu vết các vấn đề gặp phải, bài học kinh nghiệm và các quyết định kiến trúc quan trọng trong quá trình phát triển GameTopUp.

---

## 🚨 Critical Infrastructure Constraints
*Các ràng buộc hạ tầng bắt buộc phải tuân thủ để đảm bảo hệ thống vận hành ổn định.*

- **Testcontainers MariaDB Migration**: Chuyển từ SQLite sang MariaDB Docker mang lại môi trường sát production hơn nhưng đòi hỏi quản lý vòng đời (IAsyncLifetime) và khởi tạo bất đồng bộ để tránh Deadlock.
- **Async Thread-safety (SemaphoreSlim)**: Khi khởi tạo resource tĩnh (như Database Schema) trong môi trường test chạy song song, bắt buộc dùng `SemaphoreSlim` thay cho `lock` để hỗ trợ `await`.
- **High-Signal Commenting**: Loại bỏ mọi từ gây nhiễu (WHY, Lý do). AI và Developer đọc tốt nhất khi comment trực diện, kỹ thuật và súc tích.

---

## 📅 Chronological Logs

### [2026-04-28]
**Topic: Schema Synchronization & Audit Columns**
- **Type**: Bug Fix
- **Tags**: [testing] [sqlite] [sql] [audit]
- **Scope**: Integration Tests, DAL
- **Impact**: Loại bỏ hoàn toàn lỗi 500 (No such column/table) trong môi trường CI/CD và Integration Test.

**Bài học rút ra**:
- Script `CREATE TABLE` trong `CustomWebApplicationFactory.cs` phải là "Single Source of Truth" cho schema in-memory.
- Đảm bảo mapping `MatchNamesWithUnderscores = true` để đồng bộ PascalCase và snake_case.

---

### [2026-04-29]
**Topic: Search Optimization & Coding Style**
- **Type**: Architecture Decision / Best Practice
- **Tags**: [sql] [performance] [search] [coding-style]
- **Scope**: DAL, BLL (Service Layer)
- **Impact**: Tối ưu tốc độ tìm kiếm, tránh table scan trong production và tăng khả năng bảo trì mã nguồn.

**Bài học rút ra**:
- **Normalization**: Luôn truy vấn trên cột `normalized_name` đã được xử lý (lowercase, no accent). Tuyệt đối không dùng `LOWER()` trong `WHERE` để bảo toàn Database Index.
- **Explicit Logic**: Ưu tiên khối mã `{ ... }` và `Rationale` cho logic phức tạp. Tránh lạm dụng expression-bodied (`=>`) cho các tác vụ quan trọng.

---

### [2026-05-02]
**Topic: User Management, Mapster & Test Suite Refactor**
- **Type**: Architecture Decision / Best Practice
- **Tags**: [mapster] [user-management] [soft-delete] [testing] [api-response]
- **Scope**: API Layer, Service Layer, Integration Tests
- **Impact**: Thống nhất hành vi toàn hệ thống, bảo toàn dữ liệu giao dịch và tăng độ tin cậy (reliability) của bộ test lên 100%.

**Bài học rút ra**:
- **Soft Delete**: Luôn sử dụng `is_active = 0` cho các thực thể chứa lịch sử giao dịch (như User).
- **Mapster Pattern**: Duy trì cấu trúc 3 dòng (**Retrieve -> Adapt -> Save**) và cấu hình `IgnoreNullValues(true)`.
- **Exception Handling**: Chuyển đổi từ `BusinessException` sang `NotFoundException` cho các trường hợp 404 để API trả về status code chính xác.
- **ApiResponse Wrapper**: Trong Test, luôn sử dụng `ApiResponseTestWrapper<T>` để giải mã dữ liệu từ property `.Data`.
- **Verification Strategy**: Test case phải xác minh sự thay đổi thực tế trong Database (State Verification) thay vì chỉ kiểm tra HTTP Status Code.

---

### [2026-05-02]
**Topic: Documentation Standardization & Knowledge Management**
- **Type**: Best Practice
- **Tags**: [documentation] [workflow] [knowledge-management]
- **Scope**: Entire Project
- **Impact**: Tăng tính chuyên nghiệp, dễ dàng onboarding và bảo trì hệ thống tri thức dự án lâu dài.

**Bài học rút ra**:
- **Source Sync**: Tài liệu (README, memory, rules) phải luôn được đồng bộ hóa với thực tế codebase (kiểm tra .csproj, packages và cấu trúc filesystem) thay vì chỉ viết dựa trên giả định.
- **Semantic Naming**: Chuyển đổi naming convention từ PLAN-XXX sang PLAN-{topic}-{subtopic}.md giúp việc phân loại và tìm kiếm kế hoạch trở nên trực quan và có tính ngữ nghĩa cao hơn.
- **Elite Documentation Structure**: Việc áp dụng metadata (Type, Impact, Scope) vào nhật ký tri thức giúp định vị nhanh chóng phạm vi ảnh hưởng của các quyết định kiến trúc cũ.
- **Tone Balance**: Duy trì tông giọng kỹ thuật trung lập, súc tích (plain technical) giúp tài liệu trở nên đáng tin cậy và tập trung vào giá trị thực thi thay vì mô tả bóng bẩy.

**Tránh**:
- Tránh việc liệt kê các công nghệ không còn sử dụng (như SqlKata) trong tài liệu chính thức.
- Tránh đặt tên file kế hoạch theo số thứ tự đơn thuần, gây khó khăn khi số lượng task tăng lên.

---

### [2026-05-02]
**Topic: Exception Architecture Simplification**
- **Type**: Architecture Decision
- **Tags**: [exception] [refactor] [clean-code]
- **Scope**: BLL Exceptions
- **Impact**: Giảm sự phức tạp của hệ thống Exception, giúp việc ném lỗi trở nên linh hoạt và dễ bảo trì hơn.

**Bài học rút ra**:
- **Simplification over Structure**: Thay vì cố gắng cấu trúc hóa tham số cho NotFoundException (item, field, value), việc sử dụng một chuỗi message duy nhất giúp Agent và Developer dễ dàng tùy biến thông báo lỗi mà không bị ràng buộc bởi constructor phức tạp.
- **Unified Interface**: Tất cả các Business Exception (NotFound, Unauthorized, Forbidden) hiện đã có chung một mẫu constructor nhận message, giúp đồng bộ hóa cách xử lý tại Middleware.
- **Test Alignment**: Khi thay đổi cấu trúc Exception, bắt buộc phải cập nhật cả Unit Tests và Integration Tests để khớp với nội dung Message mới.

**Thay đổi**:
- NotFoundException constructor: (item, field, value) -> (message).
- Cập nhật toàn bộ Service gọi và Test assertions tương ứng.

---

### [2026-05-02]
**Topic: Database Indexing & Scope Discipline**
- **Type**: Best Practice
- **Tags**: [database] [indexing] [workflow]
- **Scope**: Entire Project
- **Impact**: Đảm bảo hiệu năng truy vấn tối ưu mà không phá vỡ cấu trúc dữ liệu hiện tại.

**Bài học rút ra**:
- **Scope Discipline**: Tuyệt đối không tự ý bổ sung cột mới (normalized_name) vào schema nếu không có trong Entity hiện tại, ngay cả khi nó tuân thủ quy tắc chung (rules.md). Việc này gây lỗi NOT NULL và làm hỏng bộ test.
- **Index-to-DAL Mapping**: Việc thiết lập Index phải dựa trên bằng chứng thực tế từ các câu lệnh WHERE và ORDER BY trong lớp DAL để đạt hiệu quả cao nhất.
- **Selectivity Principle**: Ưu tiên Composite Index với cột High Selectivity lên trước để Query Optimizer hoạt động hiệu quả.
- **Collateral Damage Awareness**: Một thay đổi nhỏ ở schema có thể ảnh hưởng đến toàn bộ các lớp (DAL Entities, BLL Services, Tests). Luôn đồng bộ hóa tất cả các lớp khi có thay đổi schema.

**Tránh**:
- Tránh thêm cột NOT NULL mà không cập nhật code khởi tạo tương ứng.
- Tránh đánh Index đơn lẻ trên các cột độ chọn lọc thấp (như is_active).

---

### [2026-05-02]
**Topic: Wallet Decoupling, Race Conditions & Service Isolation**
- **Type**: Architecture Decision
- **Tags**: [wallet] [refactor] [race-condition] [service-isolation] [usecase]
- **Scope**: Service Layer (BLL), Data Access Layer (DAL)
- **Impact**: Tách biệt hoàn toàn trách nhiệm giữa User và Wallet, đảm bảo an toàn dữ liệu trước các cuộc tấn công Race Condition và tăng tính module hóa của hệ thống.

**Bài học rút ra**:
- **Race Condition Awareness**: Luôn giả định Race Condition có thể xảy ra ngay cả khi đã có kiểm tra logic (Logic Check). Sử dụng `try-catch` để bắt lỗi vi phạm ràng buộc `UNIQUE`/`Duplicate` từ Database và chuyển đổi thành `BusinessException` thân thiện với người dùng.
- **Service Isolation (Data Ownership)**: Mỗi Service chỉ được phép truy cập vào Repository của chính nó ("dữ liệu của ai người đó giữ"). Tuyệt đối không inject Repository của thực thể khác vào Service.
- **UseCase Pattern**: Khi một nghiệp vụ cần tương tác giữa nhiều Service (ví dụ: tạo User và Wallet), phải sử dụng lớp `UseCase` hoặc `ApplicationService` để điều phối (orchestrate) thay vì gọi chéo giữa các Service.
- **Lazy Initialization (Manual)**: Việc tách biệt quy trình đăng ký tài khoản và kích hoạt ví giúp hệ thống linh hoạt hơn, cho phép trì hoãn việc cấp phát tài nguyên cho đến khi thực sự cần thiết.

---

### [2026-05-03]
**Topic: Admin Order Operations (Cancellation & Completion)**
- **Type**: Implementation / Best Practice
- **Tags**: [order-management] [idempotency] [api-design] [transaction]
- **Scope**: API Layer, Service Layer (BLL), UseCase
- **Impact**: Tăng tính ổn định của hệ thống trước các thao tác trùng lặp của Admin và chuẩn hóa giao tiếp API.

**Bài học rút ra**:
- **Idempotency (Tính giao hoán)**: Đối với các thao tác quan trọng như Hủy đơn/Hoàn tiền, hệ thống phải xử lý được các request trùng lặp (spam API). Nếu tài nguyên đã ở trạng thái mục tiêu (Cancelled), trả về thành công ngay lập tức thay vì báo lỗi.
- **API Semantics (POST vs DELETE)**: Sử dụng `POST` cho các hành động thay đổi trạng thái (state transition) thay vì `DELETE`. `DELETE` chỉ nên dùng khi thực sự xóa resource khỏi hệ thống.
- **Service Isolation Discipline**: Duy trì quy tắc UseCase chỉ gọi Service, Service chỉ gọi Repo của chính nó. Việc này giúp code testable hơn (có thể mock từng lớp) và giảm coupling.
- **Generic Transaction Mocking**: Khi mock `DatabaseContext` trong unit test, cần chú ý mock đủ cả các overload generic `Task<T>` và non-generic `Task` của `ExecuteInTransactionAsync`.
- **Status Guardrails**: Khi chuyển trạng thái đơn hàng sang "Hoàn thành" (Completed), bắt buộc phải kiểm tra hai điều kiện song song: Trạng thái hiện tại phải là "Đang xử lý" (Processing) và người thực hiện phải là Admin đã nhận đơn (`AssignTo`).
- **Atomic Update Principle**: Sử dụng câu lệnh `UPDATE` kèm điều kiện `WHERE` chặt chẽ cho cả `status` và `assign_to` là cách tốt nhất để chống Race Condition mà không cần lock bảng phức tạp.
- **Audit Consistency**: Mỗi lần thay đổi trạng thái quan trọng (Pending -> Processing -> Completed) đều phải đi kèm with một bản ghi `OrderHistory`.

---

### [2026-05-04]
**Topic: Strict Transaction Boundaries & Pessimistic Locking Evolution**
- **Type**: Architecture Decision / Concurrency Strategy
- **Tags**: [transaction] [usecase] [pessimistic-lock] [clean-architecture]
- **Scope**: Entire System (BLL, UseCase, DAL)
- **Impact**: Xử lý triệt để Race Conditions kèm side-effects phức tạp mà không làm rò rỉ logic nghiệp vụ vào Repository.

**Bài học rút ra**:
- **Transaction Responsibility**: Transaction MUST ONLY be created at the UseCase layer. Service layer MUST NOT create, commit, or rollback transactions (transaction-agnostic).
- **The Evolution from Conditional Updates to Pessimistic Locking**: 
    - Tránh tạo hàng loạt hàm Repository đặc thù cho từng trạng thái.
    - Sử dụng `LockAndGetByIdAsync` (gọi `FOR UPDATE` trong DAL) tại UseCase ngay sau khi mở Transaction.
    - Đưa toàn bộ việc check logic (`if status == ...`) về lớp Service bằng C# thuần trên object đã khóa.
- **Trade-off**: Đừng lạm dụng khóa bi quan nếu việc cập nhật chỉ là những thao tác đơn giản, nguyên tử trên 1 bảng duy nhất (dùng Conditional Update thay thế).

---

### [2026-05-06]
**Topic: Order Fulfillment, Inventory Reservation & Wallet Audit Trail**
- **Type**: Architecture Decision / Business Logic Refactor
- **Tags**: [order-flow] [inventory-reservation] [wallet] [concurrency] [audit-trail]
- **Scope**: Order Domain, Wallet Domain
- **Impact**: Đảm bảo an toàn tài chính, tính minh bạch trong đối soát số dư và tối ưu quy trình đặt hàng.

**Bài học rút ra**:
- **Inventory Reservation (Giữ chỗ ngay)**: Thực hiện trừ tồn kho ngay tại bước `PlaceOrder` để đảm bảo công bằng và tránh Overselling.
- **Decoupled Payment Flow**: Tách biệt `PlaceOrder` và `PayOrder` để hệ thống linh hoạt hơn.
- **Atomic Balance Updates**: Sử dụng hàm nguyên tử (`IncreaseBalanceAsync`/`DecreaseBalanceAsync`) kèm Audit Trail ghi lại `balance_before` và `balance_after`.
- **Payment Flow Orchestration**: Tuân thủ trình tự: **Lock Order -> Validate -> Lock Wallet -> Debit Wallet -> Mark Order Paid**.

---

### [2026-05-16]
**Topic: Testcontainers MariaDB Migration & High-Signal Commenting**
- **Type**: Infrastructure Migration / Coding Standard
- **Tags**: [mariadb] [testcontainers] [deadlock] [thread-safety] [comment-style]
- **Scope**: Integration Testing, Coding Standard
- **Impact**: Tăng độ tin cậy của bộ test (sát Production), loại bỏ deadlock ngẫu nhiên và tối ưu context cho AI/Developer.

**Bài học rút ra**:
- **Deadlock Prevention**: Tuyệt đối không dùng `.GetResult()` trong `static constructor` để start container. Dùng `IAsyncLifetime` của xUnit để quản lý khởi động bất đồng bộ.
- **SemaphoreSlim over Lock**: Trong các phương thức `async`, dùng `SemaphoreSlim(1, 1)` thay cho `lock` để đảm bảo thread-safety khi khởi tạo schema một lần duy nhất (One-time Init).
- **Batch Schema Execution**: MySqlConnector hỗ trợ thực thi script SQL lớn (chứa Trigger/Procedure) mà không cần split dấu `;` nếu đảm bảo connection string cho phép.
- **Connection Stewardship**: Không dùng connection dùng chung (shared connection) cho toàn bộ factory. Mỗi task (Init, Reset) nên mở connection riêng để tránh stale state hoặc socket timeout.
- **High-Signal Comments**: Loại bỏ "WHY:", "Lý do:", "Ghi chú:". AI đọc tốt nhất khi comment: **Explicit (trực diện), Concise (súc tích), Contextual (ngữ cảnh), Neutral (trung tính)**. 
- **Token Efficiency**: Comment súc tích giúp giảm "noisy tokens", giúp AI nắm bắt intent nhanh hơn và chính xác hơn.
