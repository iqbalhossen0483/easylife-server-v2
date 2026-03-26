# EasyLife Server - Product Requirements Document (PRD)

## Overview

EasyLife Server is a multi-tenant ERP/business management system for retail and distribution businesses. It manages sales orders, inventory, expenses, commissions, suppliers, customers, and comprehensive financial reporting with role-based access control.

---

## System Architecture

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT (Bearer + HTTP-only cookies)
- **Multi-Tenancy:** Dynamic database switching per request via `x-tenant-id` header
- **Cache:** Redis (for distributed locking and caching)
- **Push Notifications:** Expo SDK
- **File Storage:** Local disk (multer)

---

## User Roles

| Role | Description |
|------|-------------|
| Admin | Full access: manage users, approve expenses/commissions, view all reports |
| Manager | Manage staff, view reports, limited admin capabilities |
| Store Manager | Manage inventory, products, suppliers, purchases |
| Sales Man | Create orders, manage customers, track personal targets |

---

## Feature Modules

### 1. Authentication & Authorization

- **Login** - Phone + password authentication, returns JWT token
- **Logout** - Clear JWT cookie
- **Profile** - Get current user profile with related data (targets, notes)
- **JWT Token** - Stored in HTTP-only secure cookie + Authorization header
- **Password Hashing** - bcrypt with salt rounds
- **Role-Based Guards** - Endpoint-level role enforcement via decorators

### 2. Multi-Tenant System

- **Tenant Registry** - `db_list` table in root database stores tenant metadata
- **Dynamic DB Switching** - Each request routes to tenant-specific database
- **Tenant Validation** - Middleware validates `x-tenant-id` header
- **Tenant Isolation** - Complete data isolation between tenants
- **Tenant Metadata** - Track user count, product count, customer count per tenant

### 3. User Management

- **Create User** - Admin creates users with name, phone, password, designation, address
- **List Users** - Paginated list with search (by name/phone)
- **Get Single User** - Detailed user profile with relationships
- **Update User** - Partial update of user fields including profile image
- **Soft Delete User** - Mark as deleted without removing data
- **User Financial Fields** - Track: haveMoney (cash balance), debt, total_sale, due_sale, due_collection, get_salary, incentive
- **Profile Image Upload** - Upload/update user profile picture
- **Recent Activity** - Get user's recent orders, collections, expenses

### 4. Customer Management

- **Create Customer** - Shop name, address, phone, machine type/model, profile image
- **List Customers** - Paginated with search (by shop name/address)
- **Get Single Customer** - With order history and financial summary
- **Update Customer** - Partial update with image support
- **Soft Delete Customer** - Mark as deleted
- **Customer Financial Fields** - Track: totalSale, dueSale, due, collection, discount, lastOrder
- **Commission Rate** - Per-customer commission percentage
- **Added By** - Track which user added the customer

### 5. Product Management

- **Create Product** - Name, short name, type, sort order, profile image
- **List Products** - With search (by name), selectable columns
- **Get Single Product** - Full product details
- **Update Product** - Partial update with image support
- **Delete Product** - Remove product
- **Inventory Fields** - Track: stock, purchased, sold, production quantities

### 6. Supplier Management

- **Create Supplier** - Name, phone, address, profile image
- **List Suppliers** - With search (by name/phone), selectable columns
- **Get Single Supplier** - With purchase history
- **Update Supplier** - Partial update with image support
- **Delete Supplier** - Remove supplier
- **Supplier Financial Fields** - Track: totalPurchased, giveAmount, debtAmount, discount

### 7. Order Management

- **Create Order** - Customer, products (qty, price), delivery user, payment details
- **List Orders** - With date range, customer, user, status filters
- **Edit Order** - Modify order products and details
- **Deliver Order** - Mark as delivered, update: customer totals, product stock, user stats, cash/stock reports, sales targets
- **Collect Payment** - Receive payment against delivered order, create collection record, update cash reports
- **Delete Order** - Remove order
- **Order Products** - Linked product list with qty, price, total per order
- **Collection Records** - Individual payment records against orders with receiver tracking
- **Discount Handling** - Discounts recorded as expenses automatically

### 8. Purchase Management

- **Record Purchase** - From supplier with product list, payment, file uploads
- **List Purchases** - With optional product details
- **Pay Supplier** - Record payment against purchase, update supplier debt
- **Purchase Products** - Linked product list per purchase
- **File Attachments** - Multiple invoice/document uploads per purchase
- **Auto Updates** - Updates: supplier financials, product stock, user cash balance, transaction history, cash/stock reports

### 9. Production Tracking

- **Record Production** - Main product produced from component products
- **List Production** - History with component details
- **Stock Updates** - Main product stock increases, component stocks decrease
- **Report Updates** - Daily/monthly/yearly stock reports updated automatically

### 10. Expense Management

- **Submit Expense** - User submits expense (pending for non-admin, direct for admin)
- **Approve Expense** - Admin approves pending expense, updates user balance and cash reports
- **Reject Expense** - Admin rejects pending expense
- **List Expenses** - With date range and type filters
- **Expense Categories** - CRUD for user-defined expense types (Salary, Incentive, Discount, etc.)
- **Approval Workflow** - Non-admin submissions require admin approval before processing

### 11. Commission & Target System

- **Create Target** - Set sales target for user: target amount, commission %, start/end date
- **Track Achievement** - Auto-update achieved amount as user delivers orders
- **Target Status** - PENDING → RUNNING → ACHIEVED/FAILED (auto-managed)
- **Daily Processing** - Cron job checks expired targets at midnight
- **Commission Approval** - Admin approves generated commissions
- **Push Notifications** - Notify users of new targets and status changes
- **Conflict Prevention** - Max one pending/running target per user
- **Commission Calculation** - Split between delivery user and order creator

### 12. Balance Transfer System

- **Initiate Transfer** - User requests balance transfer to another user
- **Accept Transfer** - Receiver accepts pending transfer
- **Decline Transfer** - Receiver declines transfer
- **Transfer Purposes** - Salary, Incentive, Debt Payment, Purchase Product
- **Transaction History** - All completed transfers logged in transaction table
- **Auto-Expense** - Salary/Incentive transfers auto-create expense records

### 13. Notes

- **Create Note** - User creates personal note with title and content
- **List Notes** - Paginated list of user's own notes
- **Update Note** - Owner can update their notes
- **Delete Note** - Owner can soft-delete their notes
- **Ownership Enforcement** - Only note owner can view/edit/delete

### 14. Dashboard & Reports

- **Daily Dashboard** - Today's sales, collections, expenses, cash position
- **Cash Reports** - Daily/monthly/yearly with: opening, closing, totalSale, dueSale, collection, expense, purchase, marketDue, cashIn, cashOut
- **Stock Reports** - Daily/monthly/yearly per product: totalSold, remainingStock, previousStock, purchased
- **Chart Data** - Sales trends over time (line/bar charts)
- **Pie Chart Data** - Expense breakdown by category
- **Product Chart Data** - Product-wise sales analysis
- **Notifications** - Undelivered orders list
- **Transaction History** - All financial transactions log
- **Report Auto-Creation** - Cron job creates daily reports at midnight
- **Report Validation** - Auto-fix inconsistencies across daily/monthly/yearly reports
- **Duplicate Detection** - Find and merge duplicate report entries

### 15. Push Notifications

- **Send Notifications** - Via Expo SDK to mobile app users
- **Target by Role** - Send to specific user types or exclude certain roles
- **Target Specific Users** - Send to individual users
- **Batch Sending** - Chunk messages for efficient delivery
- **Token Management** - Track user push tokens

### 16. File Upload

- **Profile Images** - Single image upload for users, customers, products, suppliers
- **Purchase Documents** - Multiple file uploads for invoices/documents
- **Supported Formats** - JPG, JPEG, PNG
- **Naming Convention** - Lowercase with timestamp to prevent conflicts
- **Image Deletion** - Auto-delete old images on update

### 17. Scheduled Tasks (Cron Jobs)

- **Daily Cash Report Creation** - Create next day's report at midnight (Asia/Dhaka timezone)
- **Commission Processing** - Check expired targets and generate pending commissions
- **Distributed Locking** - Redis-based lock to prevent concurrent task execution
- **Report Validation** - SSE stream endpoint for validating all report consistency

### 18. App/Database Info Management

- **Update Info** - Admin can update database/app metadata
- **Tenant Stats** - Track user, product, customer counts

---

## Non-Functional Requirements

### Security
- SQL injection prevention (parameterized queries via TypeORM)
- XSS protection (Helmet middleware)
- CORS with whitelist origins
- HTTP-only secure cookies for JWT
- Input validation on all endpoints (class-validator)
- Whitelist validation (strip unknown properties)
- Soft deletes to prevent data loss
- Password hashing (bcrypt)

### Performance
- Redis caching for frequently accessed data
- Connection pooling for database
- Rate limiting (throttler)
- Pagination on all list endpoints

### Reliability
- Global exception filter with standardized error responses
- Distributed locking for cron jobs
- Report validation and auto-fix
- Transaction support for critical operations

### Observability
- Request logging (Morgan/Winston)
- Error logging
- API documentation (Swagger/OpenAPI)

---

## API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Description of action",
  "data": {},
  "meta": {
    "total": 100,
    "limit": 10,
    "currentPage": 1,
    "totalPages": 10
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```
