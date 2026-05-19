# EasyLife Server V2

## 🎯 Overview

EasyLife Server V2 is a comprehensive business management system designed to streamline operations for small to medium-sized enterprises. It provides multi-tenancy support, role-based access control, and comprehensive management capabilities for the entire business lifecycle.

### Key Features

- **Multi-Tenancy Architecture**: Isolated tenant databases for data segregation and security
- **Role-Based Access Control**: Granular permission management for different user roles
- **Product & Inventory Management**: Complete product lifecycle management with supplier tracking
- **Purchase Management**: Streamlined procurement workflow from suppliers
- **Production Management**: Track and manage production processes
- **Order Management**: Customer order processing and fulfillment
- **Financial Tracking**: Expense management, transaction logging, and financial reports
- **Real-time Notifications**: Push notifications for critical business events
- **Advanced Security**: JWT-based authentication, rate limiting, helmet protection
- **Comprehensive Logging**: Winston-based logging for debugging and monitoring
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation

## 📋 Prerequisites

- **Node.js**: v18.x or later
- **npm** or **yarn**: Latest version
- **PostgreSQL**: v12 or later
- **Redis**: v6.x or later

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/iqbalhossen0483/easylife-server-v2.git
   cd easylife-server-v2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Set up environment configuration**

   Edit `.env` file with your configuration:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8080
   API_PREFIX=/api

   # CORS Configuration
   CORS_ORIGINS=http://localhost:3000,http://localhost:3001

   # JWT Configuration
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRATION=2d

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   REDIS_DB=0

   # Database Configuration
   DB_NAME=switchcafe_controller
   DB_USERNAME=your-db-user
   DB_PASS=your-db-password
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. **Set up database**

   Ensure PostgreSQL is running and the database is created:

   ```bash
   createdb switchcafe_controller
   ```

6. **Start development server**
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:8080/api`

## 📦 Available Scripts

| Script                | Description                                 |
| --------------------- | ------------------------------------------- |
| `npm run build`       | Build the NestJS application for production |
| `npm run start`       | Start the production server                 |
| `npm run start:dev`   | Start development server with file watching |
| `npm run start:debug` | Start debug mode with inspection            |
| `npm run start:prod`  | Run compiled production build               |
| `npm run format`      | Format code using Prettier                  |
| `npm run lint`        | Lint and auto-fix code using ESLint         |
| `npm test`            | Run unit tests                              |
| `npm run test:watch`  | Run tests in watch mode                     |
| `npm run test:cov`    | Generate test coverage report               |
| `npm run test:debug`  | Debug tests with Node inspector             |
| `npm run test:e2e`    | Run end-to-end tests                        |

## 🏗️ Project Structure

```
src/
├── configs/              # Configuration modules
│   ├── env.config.module.ts
│   ├── jwt.config.module.ts
│   ├── redis.config.module.ts
│   ├── throttler.config.module.ts
│   ├── swagger.config.ts
│   └── winston.config.ts
├── database/             # Database configuration
│   ├── root.database.module.ts
│   └── tenant.database.module.ts
├── middleware/           # Global middleware & filters
│   ├── exception.filter.ts
│   └── api.validation.pipe.ts
├── modules/              # Feature modules
│   ├── admin_and_manager/
│   │   ├── expense_category/
│   │   ├── product/
│   │   ├── production/
│   │   ├── purchase/
│   │   ├── report/
│   │   ├── supplier/
│   │   ├── targets/
│   │   ├── tenant/
│   │   └── user/
│   ├── auth/             # Authentication & Authorization
│   ├── common/           # Shared features
│   │   ├── customer/
│   │   ├── expense/
│   │   ├── notes/
│   │   ├── notification/
│   │   ├── order/
│   │   ├── transaction/
│   │   └── user/
│   └── scheduled/        # Scheduled tasks
├── app.module.ts         # Root application module
└── main.ts               # Application entry point
```

## 🔐 Security Features

- **Helmet**: HTTP headers security middleware
- **Rate Limiting**: Throttling to prevent abuse
- **CORS**: Configurable cross-origin resource sharing
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Class-validator for DTO validation
- **Exception Filtering**: Centralized error handling
- **Cookie Parser**: Secure cookie management

## 🗄️ Database

### Architecture

The application uses a multi-tenancy architecture with:

- **Root Database**: Contains tenant metadata, global users, and system configuration
- **Tenant Databases**: Isolated databases for each tenant's data

### ORM

- **TypeORM**: Modern ORM with full TypeScript support
- **PostgreSQL**: Primary database engine

## 🔄 Key Modules

### Authentication Module

Handles user authentication, JWT token generation, and authorization.

### Admin & Manager Modules

- **Expense Category**: Manage expense categories
- **Product**: Product catalog management
- **Production**: Production workflow management
- **Purchase**: Supplier purchase orders
- **Report**: Financial and operational reports
- **Supplier**: Supplier management
- **Target**: Sales and operational targets
- **Tenant**: Multi-tenant management
- **User**: User and role management

### Common Modules

- **Customer**: Customer information management
- **Expense**: Expense tracking and management
- **Note**: Internal notes system
- **Notification**: Push notifications
- **Order**: Order management and fulfillment
- **Transaction**: Financial transaction tracking
- **User Self**: User profile management

### Scheduled Tasks

Automated background jobs for periodic operations.

## 🔔 Notifications

The application supports push notifications via Expo Server SDK for real-time alerts on critical business events.

## 📊 Logging

Comprehensive logging using Winston with support for:

- Console output (development)
- File rotation
- Structured logging
- Multiple log levels (error, warn, info, debug)

## 📚 API Documentation

When running in development mode, Swagger/OpenAPI documentation is automatically generated and available at:

```
http://localhost:8080/docs
```

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

## 🛠️ Development Workflow

### Code Formatting

```bash
npm run format
```

### Linting

```bash
npm run lint
```

All code follows strict TypeScript and ESLint configurations for code quality and consistency.

## 📝 Environment Configuration

### Development Setup

1. PostgreSQL must be running locally or accessible
2. Redis must be running for caching and session management
3. Update `.env` with local credentials

### Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` value
3. Configure appropriate `CORS_ORIGINS`
4. Use environment-specific database credentials
5. Enable all security features (Helmet, rate limiting)

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Running Production Build

```bash
npm run start:prod
```
