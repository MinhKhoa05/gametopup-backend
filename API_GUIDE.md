# GameTopUp API Reference

This document provides instructions for integrating and using the GameTopUp APIs in the frontend application.

## 1. Overview

- **Base URL:** `http://localhost:5000`
- **Response Format:** All responses are wrapped in an `ApiResponse` object.
- **Contract Source:** Always verify schemas in [Swagger](http://localhost:5000/swagger).

### Standard Wrapper
```json
{
  "success": true, // false if error occurs
  "message": "Detailed message",
  "data": { ... } // Actual payload or null
}
```

## 2. Enums & Mappings

### 📦 Order Status
| Value | Status | Description |
| :--- | :--- | :--- |
| `1` | **Pending** | Order placed, waiting for payment |
| `2` | **Paid** | Payment successful, waiting for admin to pick |
| `3` | **Processing** | Admin has picked and is processing the top-up |
| `4` | **Completed** | Top-up successful |
| `5` | **Cancelled** | Order cancelled (Stock and money refunded if applicable) |

### 💳 Wallet Transaction Type
| Value | Type | Description |
| :--- | :--- | :--- |
| `1` | **Deposit** | Money added to wallet |
| `2` | **Withdraw** | Money removed from wallet |
| `3` | **PaidOrder** | Money deducted for order payment |
| `4` | **Refund** | Money returned from cancelled order |

## 3. Request/Response Schema (Critical Endpoints)

### 🔐 Authentication
| Endpoint | Request Body | Response Data |
| :--- | :--- | :--- |
| `POST /api/auth/login` | `{ "email": "customer01@...", "password": "..." }` | `{ "accessToken": "eyJhbGci..." }` |
| `POST /api/auth/register` | `{ "name": "User01", "email": "...", "password": "..." }` | `null` |
| `GET /api/users/me` | *None* | `{ "id": 2, "name": "...", "email": "...", "role": "Member" }` |

### 🛒 Ordering & Wallet
| Endpoint | Request Body | Response Data | Notes |
| :--- | :--- | :--- | :--- |
| `POST /api/wallet/transactions/deposit` | `{ "amount": 100000 }` | `null` | Directly credits balance (Dev mode) |
| `POST /api/orders/place` | `{ "gamePackageId": 1, "quantity": 1, "gameAccountInfo": "..." }` | `123` | Returns generated Order ID |
| `POST /api/orders/{id}/pay` | *None* | `null` | Debits wallet and marks as Paid |
| `GET /api/orders/{id}` | *None* | `{ "id": 123, "status": 1, "total": 50000, ... }` | Refer to Enum mapping for `status` |

## 4. Quick Testing Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gametopup.com` | `Admin123456@` |
| **Member** | `customer01@gametopup.com` | `Admin123456@` |
| **Member** | `customer02@gametopup.com` | `Admin123456@` |

## 5. Endpoint List

| Module | Method | Endpoint | Description | Auth | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Register new account | No | Public |
| | POST | `/api/auth/login` | Login and get Token | No | Public |
| | PUT | `/api/auth/password` | Change password | Yes | Member |
| **User** | GET | `/api/users/me` | Get profile | Yes | Member |
| | GET | `/api/users` | List users | Yes | Admin |
| | GET | `/api/users/{id}` | User details | Yes | Admin |
| **Game** | GET | `/api/games` | List all games | No | Public |
| | POST | `/api/games` | Create game | Yes | Admin |
| **Wallet** | GET | `/api/wallet` | Check balance | Yes | Member |
| | GET | `/api/wallet/transactions` | Transaction history | Yes | Member |
| | POST | `/api/wallet/transactions/deposit`| Top-up | Yes | Member |
| **Order** | POST | `/api/orders/place` | Place order | Yes | Member |
| | POST | `/api/orders/{id}/pay` | Pay order | Yes | Member |
| | GET | `/api/orders/me` | My orders | Yes | Member |
| | POST | `/api/orders/{id}/pick` | Admin: Pick order | Yes | Admin |
| | POST | `/api/orders/{id}/complete`| Admin: Complete | Yes | Admin |
| | POST | `/api/orders/{id}/cancel` | Cancel & Refund | Yes | Member/Admin|

## 6. Important Notes

### HTTP Status Codes
| Code | Meaning |
| :--- | :--- |
| `200` | OK - Success |
| `201` | Created - Resource created |
| `400` | Bad Request - Invalid input or rule violation |
| `401` | Unauthorized - Invalid or expired token |
| `403` | Forbidden - Insufficient permissions (Admin only) |
| `500` | Internal Server Error - Server-side fault |

### Data Types
- **Decimals**: Handle `Balance` and `Price` as numeric types.
- **Dates**: ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`).

## ✨ 7. Core Workflows

### 👤 User Flow
1. **Onboarding**: `Register` → `Login` → Wallet is automatically created on first use (deposit or order).
2. **Deposit**: `POST /api/wallet/transactions/deposit` (Credits balance directly in Dev).
3. **Purchasing**:
   - `POST /api/orders/place`: Reserves stock, order status becomes **Pending (1)**.
   - `POST /api/orders/{id}/pay`: Debits wallet, order status becomes **Paid (2)**.
4. **Tracking**: Call `GET /api/orders/me` to track the order fulfillment status.

### 🛠 Admin Flow
1. **Fulfillment**: Call `GET /api/orders` to find orders with status **Paid (2)**.
2. **Picking**: Call `POST /api/orders/{id}/pick` to assign the order (Status: **Processing (3)**).
3. **Processing**: Perform the actual game top-up based on the `GameAccountInfo`.
4. **Completion**: Call `POST /api/orders/{id}/complete` to finish (Status: **Completed (4)**).

