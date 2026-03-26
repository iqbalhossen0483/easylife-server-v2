# EasyLife Server v2 - Task Breakdown

## Progress: 92 / 155 tasks completed (59%)

---

## 1. Project Setup & Configuration

- [x] 1.1 Initialize NestJS project
- [x] 1.2 Configure TypeORM with PostgreSQL
- [x] 1.3 Set up environment configuration (ConfigModule)
- [x] 1.4 Configure CORS
- [x] 1.5 Set up Helmet security middleware
- [x] 1.6 Configure global ValidationPipe
- [x] 1.7 Set up global exception filter (AllExceptionFilter)
- [x] 1.8 Configure cookie-parser
- [x] 1.9 Set up API prefix (`/api`)
- [x] 1.10 Set up Winston logger (replace console.log)
- [x] 1.11 Configure Swagger/OpenAPI documentation
- [x] 1.12 Configure rate limiting (ThrottlerModule)
- [x] 1.13 Set up Redis connection module
- [x] 1.14 Configure multer for file uploads (module-level)

---

## 2. Multi-Tenant Architecture

- [x] 2.1 Create DbListEntity for tenant registry
- [x] 2.2 Create TenantDatabaseService (REQUEST scope)
- [x] 2.3 Create TenantDatabaseModule
- [x] 2.4 Create ApiValidationPipe middleware (x-tenant-id validation)
- [x] 2.5 Implement dynamic DataSource creation per tenant
- [x] 2.6 Implement connection caching
- [x] 2.7 Add tenant metadata tracking (user/product/customer counts)
- [x] 2.8 Add tenant info update endpoint (Admin)

---

## 3. Authentication & Authorization

- [x] 3.1 Create AuthModule
- [x] 3.2 Create LoginDto with validation
- [x] 3.3 Implement login endpoint (POST /auth/login)
- [x] 3.4 Implement logout endpoint (POST /auth/logout)
- [x] 3.5 Implement get-profile endpoint (GET /auth/get-profile)
- [x] 3.6 Create AuthGuard (JWT verification)
- [x] 3.7 Create RoleGuard with @Role decorator
- [x] 3.8 Create @CurrentUser decorator
- [x] 3.9 Create @CurrentTenantId decorator
- [x] 3.10 Implement JWT token generation
- [x] 3.11 Implement HTTP-only cookie setting
- [x] 3.12 Implement bcrypt password hashing
- [x] 3.13 Create Designation enum (ADMIN, MANAGER, STORE_MANAGER, SALES_MAN)

---

## 4. User Management

- [x] 4.1 Create UserEntity with all fields
- [x] 4.2 Create CreateUserDto with validation
- [x] 4.3 Create UpdateUserDto (partial)
- [x] 4.4 Create GetAllUserDto (pagination + search)
- [x] 4.5 Implement create user endpoint (POST /user/create) - Admin only
- [x] 4.6 Implement list users endpoint (GET /user/all) - Admin only
- [x] 4.7 Implement get single user endpoint (GET /user/single-user/:id)
- [x] 4.8 Implement update user endpoint (PUT /user/update/:id)
- [x] 4.9 Implement soft delete user endpoint (DELETE /user/delete/:id)
- [x] 4.10 Add profile image upload on create/update
- [x] 4.11 Implement recent activity endpoint (GET /user/recent-activity)
- [x] 4.12 Add user financial fields tracking (haveMoney, debt, total_sale, etc.)

---

## 5. Customer Management

- [x] 5.1 Create CustomerEntity with all fields
- [x] 5.2 Create CreateCustomerDto with validation
- [x] 5.3 Create UpdateCustomerDto (partial)
- [x] 5.4 Create GetAllCustomerDto (pagination + search)
- [x] 5.5 Implement create customer endpoint (POST /customer/create)
- [x] 5.6 Implement list customers endpoint (GET /customer/all)
- [x] 5.7 Implement get single customer endpoint with order history
- [x] 5.8 Implement update customer endpoint (PUT /customer/update/:id)
- [x] 5.9 Implement soft delete customer endpoint
- [x] 5.10 Add profile image upload on create/update
- [x] 5.11 Add customer financial fields (totalSale, dueSale, due, collection, discount)
- [x] 5.12 Register CustomerModule in AppModule

---

## 6. Product Management

- [x] 6.1 Create ProductEntity with all fields
- [x] 6.2 Create CreateProductDto with validation
- [x] 6.3 Create UpdateProductDto (partial)
- [x] 6.4 Create GetAllProductDto (pagination + search)
- [x] 6.5 Implement create product endpoint (POST /product/create)
- [x] 6.6 Implement list products endpoint (GET /product/all)
- [x] 6.7 Implement get single product endpoint
- [x] 6.8 Implement update product endpoint (PUT /product/update/:id)
- [x] 6.9 Implement delete product endpoint
- [x] 6.10 Add product image upload on create/update
- [x] 6.11 Add inventory fields (stock, purchased, sold, production)

---

## 7. Supplier Management

- [x] 7.1 Create SupplierEntity with all fields
- [x] 7.2 Create CreateSupplierDto with validation
- [x] 7.3 Create UpdateSupplierDto (partial)
- [x] 7.4 Create GetAllSupplierDto (pagination + search)
- [x] 7.5 Implement create supplier endpoint (POST /supplier/create)
- [x] 7.6 Implement list suppliers endpoint (GET /supplier/all)
- [x] 7.7 Implement get single supplier endpoint with purchase history
- [x] 7.8 Implement update supplier endpoint (PUT /supplier/update/:id)
- [x] 7.9 Implement delete supplier endpoint
- [x] 7.10 Add supplier image upload on create/update
- [x] 7.11 Add supplier financial fields (totalPurchased, giveAmount, debtAmount, discount)

---

## 8. Order Management

- [ ] 8.1 Create OrderEntity with all fields
- [ ] 8.2 Create OrderProductEntity (order-product junction)
- [ ] 8.3 Create CollectionEntity (payment records)
- [ ] 8.4 Create CreateOrderDto with validation
- [ ] 8.5 Create UpdateOrderDto
- [ ] 8.6 Create GetAllOrderDto (filters: date range, customer, user, status)
- [ ] 8.7 Create CollectPaymentDto
- [ ] 8.8 Implement create order endpoint (POST /order/create)
- [ ] 8.9 Implement list orders endpoint (GET /order/all)
- [ ] 8.10 Implement edit order endpoint (PUT /order/update/:id)
- [ ] 8.11 Implement deliver order endpoint (PUT /order/deliver/:id)
- [ ] 8.12 Implement collect payment endpoint (PUT /order/collect/:id)
- [ ] 8.13 Implement delete order endpoint
- [ ] 8.14 Update customer totals on delivery
- [ ] 8.15 Update product stock on delivery
- [ ] 8.16 Update user stats on delivery
- [ ] 8.17 Update cash reports on delivery/collection
- [ ] 8.18 Update stock reports on delivery
- [ ] 8.19 Update sales targets on delivery
- [ ] 8.20 Auto-create discount expense on collection

---

## 9. Purchase Management

- [ ] 9.1 Create PurchaseEntity with all fields
- [ ] 9.2 Create PurchaseProductEntity (purchase-product junction)
- [ ] 9.3 Create PurchaseCollectionEntity (payment records)
- [ ] 9.4 Create CreatePurchaseDto with validation
- [ ] 9.5 Create PaySupplierDto
- [ ] 9.6 Create GetAllPurchaseDto (filters)
- [ ] 9.7 Implement create purchase endpoint (POST /purchase/create)
- [ ] 9.8 Implement list purchases endpoint (GET /purchase/all)
- [ ] 9.9 Implement pay supplier endpoint (PUT /purchase/pay/:id)
- [ ] 9.10 Add file upload for purchase documents
- [ ] 9.11 Update supplier financials on purchase
- [ ] 9.12 Update product stock on purchase
- [ ] 9.13 Update user cash balance on purchase
- [ ] 9.14 Create transaction history on purchase
- [ ] 9.15 Update cash/stock reports on purchase

---

## 10. Production Tracking

- [ ] 10.1 Create ProductionEntity with all fields
- [ ] 10.2 Create ProductionProductEntity (component junction)
- [ ] 10.3 Create CreateProductionDto with validation
- [ ] 10.4 Create GetAllProductionDto (filters)
- [ ] 10.5 Implement create production endpoint (POST /production/create)
- [ ] 10.6 Implement list production endpoint (GET /production/all)
- [ ] 10.7 Update main product stock (increase)
- [ ] 10.8 Update component product stock (decrease)
- [ ] 10.9 Update stock reports on production

---

## 11. Expense Management

- [ ] 11.1 Create ExpenseEntity with all fields (finalize existing)
- [ ] 11.2 Create PendingExpenseEntity
- [ ] 11.3 Create CreateExpenseDto with validation
- [ ] 11.4 Create ApproveExpenseDto
- [ ] 11.5 Create GetAllExpenseDto (filters: date range, type)
- [ ] 11.6 Implement submit expense endpoint (POST /expense/create)
- [ ] 11.7 Implement approve expense endpoint (POST /expense/approve/:id) - Admin
- [ ] 11.8 Implement reject expense endpoint (DELETE /expense/reject/:id) - Admin
- [ ] 11.9 Implement list expenses endpoint (GET /expense/all)
- [ ] 11.10 Implement approval workflow (pending for non-admin, direct for admin)
- [ ] 11.11 Update user balance on expense approval
- [ ] 11.12 Update cash reports on expense approval

### 11A. Expense Categories (Admin)

- [x] 11A.1 Create ExpenseCategoryEntity
- [x] 11A.2 Create CreateExpenseCategoryDto with validation
- [x] 11A.3 Create UpdateExpenseCategoryDto
- [x] 11A.4 Create GetAllExpenseCategoryDto (pagination + search)
- [x] 11A.5 Implement create expense category endpoint
- [x] 11A.6 Implement update expense category endpoint (with previous name tracking)
- [x] 11A.7 Implement list expense categories endpoint
- [x] 11A.8 Implement get single expense category endpoint
- [x] 11A.9 Implement soft delete expense category endpoint

---

## 12. Commission & Target System

- [x] 12.1 Create TargetEntity with all fields
- [x] 12.2 Create CreateTargetDto with validation
- [x] 12.3 Create UpdateTargetDto
- [x] 12.4 Create GetTargetDto (filters: status, user)
- [x] 12.5 Implement create target endpoint (POST /target/create) - Admin
- [x] 12.6 Implement update target endpoint (PUT /target/update/:id)
- [x] 12.7 Implement list targets endpoint (GET /target/all)
- [x] 12.8 Implement get single target endpoint
- [x] 12.9 Implement soft delete target endpoint
- [x] 12.10 Add push notification on target creation/update
- [x] 12.11 Add conflict prevention (max 1 pending/running per user)
- [ ] 12.12 Create PendingCommissionEntity
- [ ] 12.13 Implement auto-update achieved amount on order delivery
- [ ] 12.14 Implement commission approval endpoint (POST /commission/approve/:id)
- [ ] 12.15 Implement commission rejection endpoint (DELETE /commission/reject/:id)
- [ ] 12.16 Implement commission calculation logic (split between delivery/creator)

---

## 13. Balance Transfer & Transactions

- [ ] 13.1 Create TransactionEntity with all fields
- [ ] 13.2 Create PendingBalanceTransferEntity
- [ ] 13.3 Create BalanceTransferDto with validation
- [ ] 13.4 Create ReceiveTransferDto
- [ ] 13.5 Implement initiate transfer endpoint (POST /transaction/transfer)
- [ ] 13.6 Implement accept transfer endpoint (POST /transaction/receive/:id)
- [ ] 13.7 Implement decline transfer endpoint (DELETE /transaction/decline/:id)
- [ ] 13.8 Implement transfer purpose logic (Salary, Incentive, Debt Payment, Purchase)
- [ ] 13.9 Auto-create expense for Salary/Incentive transfers
- [ ] 13.10 Create transaction history on completion

---

## 14. Notes

- [x] 14.1 Create NotesEntity with all fields
- [x] 14.2 Create CreateNoteDto with validation
- [x] 14.3 Create UpdateNoteDto
- [x] 14.4 Create GetQueryNoteDto (pagination)
- [x] 14.5 Implement create note endpoint
- [x] 14.6 Implement list notes endpoint (user's own)
- [x] 14.7 Implement get single note endpoint
- [x] 14.8 Implement update note endpoint (ownership enforcement)
- [x] 14.9 Implement soft delete note endpoint (ownership enforcement)

---

## 15. Dashboard & Reports

- [ ] 15.1 Create DailyCashReportEntity
- [ ] 15.2 Create MonthlyCashReportEntity
- [ ] 15.3 Create YearlyCashReportEntity
- [ ] 15.4 Create DailyStockReportEntity
- [ ] 15.5 Create MonthlyStockReportEntity
- [ ] 15.6 Create YearlyStockReportEntity
- [ ] 15.7 Implement daily dashboard endpoint (GET /dashboard)
- [ ] 15.8 Implement cash report endpoint (GET /report/cash?method=date|month|year)
- [ ] 15.9 Implement stock report endpoint (GET /report/stock?method=date|month|year)
- [ ] 15.10 Implement chart data endpoint (GET /dashboard/chart)
- [ ] 15.11 Implement pie chart data endpoint (GET /dashboard/piechart)
- [ ] 15.12 Implement product chart data endpoint (GET /dashboard/product-chart)
- [ ] 15.13 Implement undelivered orders notification endpoint
- [ ] 15.14 Implement transaction history endpoint (GET /dashboard/transactions)

---

## 16. Push Notifications

- [ ] 16.1 Create NotificationModule
- [ ] 16.2 Create SendNotificationDto
- [ ] 16.3 Implement send notification endpoint (POST /notification/send)
- [ ] 16.4 Implement target by role filtering
- [ ] 16.5 Implement batch sending with chunking
- [ ] 16.6 Add push token management on user entity

---

## 17. File Upload System

- [ ] 17.1 Create FileUploadModule with multer config
- [ ] 17.2 Configure file type validation (JPG, JPEG, PNG)
- [ ] 17.3 Implement single file upload interceptor (profiles)
- [ ] 17.4 Implement multiple file upload interceptor (documents)
- [ ] 17.5 Implement old file deletion on update
- [ ] 17.6 Serve static files from public directory

---

## 18. Scheduled Tasks (Cron Jobs)

- [ ] 18.1 Install and configure @nestjs/schedule
- [ ] 18.2 Implement daily cash report creation (midnight cron)
- [ ] 18.3 Implement commission processing (expired target check)
- [ ] 18.4 Implement Redis distributed locking for cron jobs
- [ ] 18.5 Implement report validation service (daily cash)
- [ ] 18.6 Implement report validation service (monthly cash)
- [ ] 18.7 Implement report validation service (yearly cash)
- [ ] 18.8 Implement duplicate entry detection and merge
- [ ] 18.9 Implement SSE stream endpoint for report validation (GET /validate-report)

---

## 19. Infrastructure & Quality

- [x] 19.1 Set up Winston logger with log levels
- [x] 19.2 Configure Swagger/OpenAPI with decorators
- [x] 19.3 Configure ThrottlerModule for rate limiting
- [ ] 19.4 Add health check endpoint
- [ ] 19.5 Write unit tests for AuthService
- [ ] 19.6 Write unit tests for UserService
- [ ] 19.7 Write unit tests for OrderService
- [ ] 19.8 Write unit tests for ExpenseService
- [ ] 19.9 Write E2E tests for auth flow
- [ ] 19.10 Write E2E tests for order workflow
- [ ] 19.11 Set up CI/CD pipeline
- [ ] 19.12 Create Dockerfile for production
- [ ] 19.13 Create docker-compose.yml (app + postgres + redis)
- [ ] 19.14 Add database migration scripts
