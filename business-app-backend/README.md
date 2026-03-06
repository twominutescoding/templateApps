# Business Application Backend Template

A comprehensive Spring Boot 4.0.1 backend template with **external authentication service integration**.

## 🚀 Quick Start - Generate New Project

This is a **template project** that you can use to generate new projects with custom names!

### Full-Stack Project (Backend + Frontend)

```bash
node create-project.js
```

**What it does:**
- Creates a new project with your custom name
- Updates all package names (Java + frontend)
- Configures auth-service integration
- Includes React 19 frontend
- Renames database and application
- Creates project-specific README with all documentation

### Backend-Only Project (API Only)

```bash
node create-backend-only-project.js
```

**What it does:**
- Creates backend-only API project (no frontend)
- Perfect for microservices or mobile app backends
- Removes all frontend dependencies from pom.xml
- Smaller, faster builds
- Use with any frontend framework (React, Angular, Vue, mobile apps)

**See [TEMPLATE_README.md](TEMPLATE_README.md) for detailed instructions.**

---

## Architecture

This application uses **external auth-service** for authentication:
- All user authentication is handled by a separate auth-service microservice
- JWT tokens are issued by auth-service and validated locally
- Refresh tokens are managed by auth-service (24-hour expiration default, configurable, with rotation)
- No local user database (users stored in auth-service)
- Roles are embedded in JWT tokens for authorization

## Features

- ✅ **Spring Boot 4.0.1** - Latest Spring Boot version
- ✅ **External Auth Integration** - JWT authentication via auth-service
- ✅ **Automatic Token Refresh** - 24-hour refresh tokens (default, configurable) with rotation
- ✅ **Spring Security** - Stateless JWT validation
- ✅ **Spring Data JPA** - Database access with Hibernate
- ✅ **Oracle Database** - For test and production profiles
- ✅ **Lombok** - Reduce boilerplate code
- ✅ **MapStruct** - DTO mapping
- ✅ **SpringDoc OpenAPI** - Auto-generated API documentation (Swagger)
- ✅ **Global Exception Handling** - Custom error codes and messages
- ✅ **CORS Configuration** - Pre-configured for frontend integration
- ✅ **Base Entity** - Auditing fields (createdAt, updatedAt, createdBy, etc.)
- ✅ **Dynamic Search** - Specification-based filtering
- ✅ **Pagination & Sorting** - Built-in support
- ✅ **Bulk Operations** - Bulk update support
- ✅ **Demo Products** - Sample CRUD operations (safe to delete)
- ✅ **React 19 Frontend** - TypeScript, Vite, Material-UI v7

## Prerequisites

1. **Auth Service must be running first!**
   - Start auth-service on port 8091 (see `auth-service/` in this repository)

2. Java 17 or higher
3. Node.js 18+ and npm
4. Maven 3.6+

## Quick Start

### 1. Start Auth Service (Required!)
```bash
# In a separate terminal
cd ../auth-service
./mvnw spring-boot:run
# Wait for: "Started AuthServiceApplication on port 8091"
```

### 2. Start Backend
```bash
./mvnw spring-boot:run
# Starts on port 8090
```

### 3. Start Frontend (Development)
```bash
cd frontend
npm install
npm run dev
# Starts on port 5173
```

## Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8090/api
- **Swagger UI**: http://localhost:8090/api/swagger-ui.html
## Authentication

### Login Credentials (from auth-service)

- **Admin**: `admin` / `password`
- **User**: `user1` / `password`
- **Manager**: `user2` / `password`

Users are managed in the auth-service database.

### Auth Service Integration

This app is configured to use auth-service at: `http://localhost:8091/auth`

To change the host, update the profile-specific properties (e.g., `application-dev.properties`):
```properties
auth.service.host=${TEMP_BUSINESS_APP_AUTH_SERVICE_HOST:http://localhost:8091/auth}
```

Endpoint paths are configured in `application.properties`:
```properties
auth.service.login-endpoint=/api/v1/auth/login
auth.service.refresh-endpoint=/api/v1/auth/refresh
auth.service.log-endpoint=/api/v1/logs
```

## Configuration

### JWT Secret (Important!)

The `jwt.secret` in this app **must match** the auth-service secret, otherwise token validation will fail.

In `application.properties`:
```properties
jwt.secret=${JWT_SECRET:your-secret-key}
```

Generate a secure secret:
```bash
openssl rand -base64 64
```

Set it in **both** applications (auth-service and this app):
```bash
export JWT_SECRET=your-generated-secret
```

### Database (Production)

Switch to Oracle in production by setting:
```bash
export SPRING_PROFILES_ACTIVE=prod
export TEMP_BUSINESS_APP_DB_URL=jdbc:oracle:thin:@your-db-host:1521:YOUR_SID
export TEMP_BUSINESS_APP_DB_USERNAME=your_user
export TEMP_BUSINESS_APP_DB_PASSWORD=your_password
```

### Environment Variables Template

A template file `ENV_TEMPLATE.env` is provided with all environment variables needed for deployment.

**Usage:**
```bash
# For Tomcat - add to setenv.sh (Linux) or setenv.bat (Windows)
cat ENV_TEMPLATE.env >> $CATALINA_HOME/bin/setenv.sh

# For IntelliJ IDEA - copy to Run Configuration environment variables
```

**Key Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `{ENTITY}_DB_URL` | Full JDBC URL | `jdbc:oracle:thin:@localhost:1521:ORCL` |
| `{ENTITY}_DB_USERNAME` | Database username | - |
| `{ENTITY}_DB_PASSWORD` | Database password | - |
| `{ENTITY}_JWT_SECRET` | JWT secret (must match auth-service) | - |
| `{ENTITY}_AUTH_SERVICE_URL` | Auth-service login URL | http://localhost:8091/auth/api/v1/auth/login |

Variables are prefixed with entity code for multi-app Tomcat deployment.

## Project Structure

```
src/main/java/com/template/business/
├── config/           # Configuration classes (CORS, Security)
├── controller/       # REST Controllers
├── demo/             # Demo package - safe to delete
│   ├── controller/   # DemoProductController
│   ├── dto/          # DemoProductDTO
│   ├── entity/       # DemoProduct (uses table: demo_products)
│   ├── repository/   # DemoProductRepository
│   └── service/      # DemoProductService
├── dto/              # Data Transfer Objects
├── entity/           # JPA Entities (BaseEntity for auditing)
├── exception/        # Custom exceptions and global handler
├── repository/       # Spring Data JPA repositories
├── security/         # JWT utilities and filters
├── service/          # Business logic
│   ├── AuthService.java           # Delegates to auth-service
│   └── ExternalAuthService.java   # REST client for auth-service
└── util/             # Utility classes (SpecificationBuilder)
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── auth/            # ProtectedRoute
│   ├── common/          # CustomPaletteEditor, DateRangeFilter, StatusChip
│   ├── layout/          # Header, Layout, Sidebar
│   └── table/           # AdvancedDataTable (with inline & bulk editing)
├── context/
│   └── DateFormatContext.tsx    # User-configurable date/timestamp formats
├── contexts/
│   └── AuthContext.tsx           # JWT authentication state
├── pages/
│   ├── demo/
│   │   └── DemoProductsPage.tsx  # Example CRUD with AdvancedDataTable
│   ├── Components.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Settings.tsx              # Theme, date format configuration
├── services/
│   └── api.ts                    # Axios client with automatic token refresh
└── theme/
    └── ThemeContext.tsx          # Dark mode & custom palettes
```

## API Endpoints

### Authentication (Proxied to auth-service)

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "type": "Bearer",
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ADMIN"]
  }
}
```

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "type": "Bearer",
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ADMIN"]
  }
}
```

### Demo Products (Example CRUD)

#### Search Products (with filtering, sorting, pagination)

```http
POST /api/demo/products/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "filters": {
    "name": "laptop",
    "category": "Electronics"
  },
  "dateRanges": {
    "createdAt": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    }
  },
  "sort": {
    "column": "price",
    "order": "desc"
  },
  "page": 0,
  "pageSize": 10
}
```

#### Other Demo Product Endpoints

```http
GET /api/demo/products/{id}           # Get by ID
POST /api/demo/products               # Create
PUT /api/demo/products/{id}           # Update
PUT /api/demo/products/bulk-update    # Bulk update
DELETE /api/demo/products/{id}        # Delete
```

## How Authentication Works

### Token Validation Flow

1. **User logs in** → Auth-service validates credentials → Returns JWT + refresh token
2. **Frontend stores tokens** in localStorage
3. **Every request** includes `Authorization: Bearer <token>` header
4. **JwtRequestFilter validates token**:
   - Verifies signature using shared JWT_SECRET
   - Checks expiration
   - Extracts username and roles from token claims
   - **No database query!** Roles come from JWT
5. **On 401 error** → Frontend automatically calls /auth/refresh → Gets new tokens → Retries request

### Role-Based Authorization

```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin-only")
public ResponseEntity<?> adminEndpoint() {
    // Only users with ADMIN role can access
}
```

Roles are extracted from JWT token by `JwtRequestFilter`:
```java
List<String> roles = claims.get("roles", List.class);
```

## Frontend Features

### AdvancedDataTable Component

**Features**:
- Server-side pagination, filtering, sorting
- Inline editing with save/cancel
- Bulk editing (edit multiple rows, save all at once)
- Date range filtering
- Export to CSV/Excel

**CRITICAL for Performance**:
- Always wrap `columns` array in `useMemo`
- Wrap callbacks (`onFetchData`, `onSave`, `onBulkSave`) in `useCallback`
- Move helper functions outside component to prevent recreation

### Date/Timestamp Formatting

User-configurable from Settings page:
```typescript
const { formatDate, formatTimestamp } = useDateFormat();
formatDate(new Date());           // "07.12.2025"
formatTimestamp(new Date());      // "07.12.2025 14:30:45"
```

**Available formats**:
- Date: DD.MM.YYYY (default), MM/DD/YYYY, YYYY-MM-DD
- Timestamp: DD.MM.YYYY HH:mm:ss (default), MM/DD/YYYY HH:mm:ss, YYYY-MM-DD HH:mm:ss

### Theme System

- Dark mode toggle
- Predefined palettes: Ocean Blue, Sunset Orange, Forest Green, Royal Purple, Cherry Red, Midnight Dark
- Custom palettes (user-created, stored in localStorage)

## Building for Production

### Backend + Frontend (Single JAR)
```bash
cd frontend
npm install
npm run build  # Outputs to src/main/resources/static/

cd ..
./mvnw clean package
java -jar target/api.war
```

### Backend Only
```bash
./mvnw clean package -Dmaven.test.skip=true
java -jar target/api.war
```

## Troubleshooting

### "Authentication service unavailable"
- **Cause**: Auth-service is not running
- **Solution**: Start auth-service first on port 8091

### "Invalid token" errors
- **Cause**: JWT_SECRET mismatch between services
- **Solution**: Ensure both use the same JWT_SECRET

### "User not found"
- **Cause**: Users exist in auth-service, not this app
- **Solution**: Login with credentials from auth-service

## Documentation

Detailed documentation is available in the [`docs/`](docs/) folder:

- **[Exception Handling](docs/EXCEPTION_HANDLING.md)** - Error handling guide

Additional documentation:
- **[Session Notes](CLAUDE.md)** - Development patterns and implementation details
- **[Environment Variables](../ENVIRONMENT_VARIABLES.md)** - Full variable reference

## Adding New Entities

When adding real business entities:

1. **Create entity** in `entity/` extending `BaseEntity` (provides createdAt, updatedAt, createdBy, modifiedBy)
2. **Create repository** in `repository/` extending `JpaRepository` and `JpaSpecificationExecutor`
3. **Create DTOs** in `dto/` for request/response
4. **Create service** in `service/` using `SearchRequest` pattern
5. **Create controller** in `controller/` with `@PreAuthorize` for role-based access
6. **Create frontend page** in `pages/` using `AdvancedDataTable`

**Remember**:
- Use `formatTimestamp` from DateFormatContext for all timestamp displays
- Use `useMemo`/`useCallback` for AdvancedDataTable props
- Extend `BaseEntity` for automatic auditing

## Demo Code

The `demo/` package contains example code that can be safely deleted:
- `com.template.business.demo` - Demo products CRUD
- `frontend/src/pages/demo` - Demo products page

To delete:
```bash
rm -rf src/main/java/com/template/business/demo/
# Also remove demo route from frontend/src/App.tsx
# Also remove "Demo Products" from frontend/src/components/layout/Sidebar.tsx
```

## Environment Variables

Set these in production (variables use `TEMP_BUSINESS_APP_` prefix — see [ENVIRONMENT_VARIABLES.md](../ENVIRONMENT_VARIABLES.md)):

```bash
export SPRING_PROFILES_ACTIVE=prod
export TEMP_BUSINESS_APP_DB_URL=jdbc:oracle:thin:@your-db-host:1521:YOUR_SID
export TEMP_BUSINESS_APP_DB_USERNAME=your_user
export TEMP_BUSINESS_APP_DB_PASSWORD=your_password
export TEMP_BUSINESS_APP_JWT_SECRET=your-production-secret-key
export TEMP_BUSINESS_APP_AUTH_SERVICE_URL=https://your-auth-service/auth/api/v1/auth/login
```

## License

This is a template project. Feel free to use and modify as needed.

## Support

For issues and questions, check:
- Code documentation in `docs/` folder
- Swagger UI for API documentation
- Session notes in `claude.md`

---

Generated from Business App Template with External Auth Architecture
