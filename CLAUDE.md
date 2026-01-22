# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **template monorepo** containing reusable Spring Boot application templates. Each subdirectory is an independent, deployable template application that can be used to bootstrap new projects.

**Template Applications:**
- `auth-service/` - Centralized authentication microservice with LDAP and database fallback
- `business-app-backend/` - Full-stack business application template (Spring Boot + React)
- `externalFiles/` - External resources (e.g., SQL scripts)

## Architecture

### Multi-Application Structure

Each template application is **independent** and can be:
1. Used as-is for specific purposes (authentication, business apps)
2. Copied to bootstrap new projects
3. Integrated together (e.g., business app using auth-service for authentication)

**Important:** When working in this repository, always specify which application you're working on, as commands must be run from the respective application directory.

## Auth Service (`auth-service/`)

A Spring Boot 4.0.1 microservice providing centralized JWT-based authentication.

### Key Features
- **Spring Boot 4.0.1**: Latest version with enhanced modularization and Java 25 support
- **Dual Authentication Strategy**: Active Directory LDAP (optional) with database fallback
- **Multi-application Support**: Entity-based role filtering via `applicationCode`
- **JWT Tokens**: HS256 algorithm with 15-minute expiration (JJWT 0.12.6)
- **Refresh Tokens**: 7-day expiration with automatic rotation
- **Database Support**: H2 (dev) and Oracle (prod)
- **SpringDoc OpenAPI 2.8.14**: Spring Boot 4.0 compatible API documentation
- **Admin Frontend**: React 19 admin panel for user/role/session management

### Authentication Flow
1. If LDAP enabled: Attempts AD authentication first, falls back to database if LDAP fails
2. If LDAP disabled: Uses database authentication only
3. **Roles are ALWAYS loaded from database**, regardless of authentication method

### Running Auth Service

```bash
cd auth-service

# Development (H2 database, port 8091)
./mvnw spring-boot:run

# Test (Oracle database with debug logging)
export SPRING_PROFILES_ACTIVE=test
export DB_HOST=localhost
export DB_PORT=1521
export DB_SID=TESTDB
export DB_USERNAME=test_user
export DB_PASSWORD=test_password
./mvnw spring-boot:run

# Production (Oracle + LDAP)
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=localhost
export DB_PORT=1521
export DB_SID=ORCL
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
export LDAP_ENABLED=true
export LDAP_URL=ldaps://your-ldap-server:636
export LDAP_BASE=your.domain.local
./mvnw spring-boot:run
```

### Spring Profiles Comparison

| Feature | Dev | Test | Prod |
|---------|-----|------|------|
| **Database** | H2 (in-memory) | Oracle | Oracle |
| **Port** | 8091 | 8091 | 8091 |
| **LDAP** | Configurable | Disabled | Enabled |
| **SQL Logging** | Yes | Yes | No |
| **Debug Logging** | Yes | Yes | No |
| **Hibernate DDL** | create-drop | update | validate |
| **H2 Console** | Enabled | Disabled | Disabled |

### LDAP Configuration

The service uses `ActiveDirectoryLdapAuthenticationProvider`:
- Authenticates against AD using `sAMAccountName` (Windows username)
- Validates passwords via LDAP bind
- Loads roles from local database (ignores AD groups)

**Environment Variables:**
- `LDAP_ENABLED` - Enable/disable LDAP (default: false)
- `LDAP_URL` - LDAP server URL (use ldaps:// for secure connection)
- `LDAP_BASE` - Active Directory domain (e.g., fng.local)
- `LDAP_USER_SEARCH_FILTER` - AD search filter (default: `(&(objectClass=user)(sAMAccountName={1}))`)

### API Endpoints

- `POST /auth/api/v1/auth/login` - Login with username/password/applicationCode
- `POST /auth/api/v1/auth/register` - Register new user
- `GET /auth/api/v1/auth/validate` - Validate JWT token
- `GET /auth/api/v1/auth/health` - Health check

### Sample Users (Dev Only)
| Username | Password | Roles |
|----------|----------|-------|
| admin | password | ADMIN (APP001, APP002) |
| user1 | password | USER, MANAGER (APP001) |
| user2 | password | USER (APP001, APP002) |

### Database Schema
- `users` - User accounts (username PK, BCrypt passwords)
- `roles` - Roles with application_code (composite PK: role_name, application_code)
- `user_roles` - User-role associations (composite PK: username, role_name, application_code)
- `application_entity` - Applications/entities that can be accessed
- `entity_type` - Types of entities (enum)
- `entity_attribute` - Entity attributes/metadata
- `refresh_token` - JWT refresh tokens for session management
- `t_mailing` - Email/notification queue system
- `user_status` - User status definitions

### Access Points
- API: http://localhost:8091/auth/api/v1/auth
- Swagger UI: http://localhost:8091/auth/swagger-ui.html
- OpenAPI Docs: http://localhost:8091/auth/v3/api-docs
- H2 Console (dev): http://localhost:8091/auth/h2-console
  - JDBC URL: `jdbc:h2:mem:authdb`
  - Username: `sa`
  - Password: (empty)

### Admin Frontend (`admin-frontend/`)

**React 19 admin panel for managing users, roles, and sessions**

**Features**:
- Dashboard with user/session statistics
- User management (view, edit, activate/deactivate)
- Role management (view, edit)
- Entity management (applications/entities)
- Session management (view, revoke)
- Mailings management (read-only view of email queue)
- Dark mode and theme customization
- Date format configuration

**Running Admin Frontend**:
```bash
cd auth-service/admin-frontend
npm install
npm run dev
# Starts on http://localhost:5174
```

**Login**: Use admin credentials (username: `admin`, password: `password`)

**Tech Stack**: React 19.2, TypeScript, Material-UI v7, Vite
**Based on**: business-app-backend/frontend (minimal code differences)

**Admin API Endpoints** (all require ADMIN role):
- User Management: `/admin/users/**`
- Role Management: `/admin/roles/**`
- Entity Management: `/admin/entities/**`
- Session Management: `/auth/admin/sessions/**`
- Mailings Management (read-only): `/admin/mailings/**`
- Dashboard Stats: `/auth/admin/stats/dashboard`

For details, see [auth-service/admin-frontend/README.md](auth-service/admin-frontend/README.md) and [auth-service/docs/ADMIN_FRONTEND.md](auth-service/docs/ADMIN_FRONTEND.md)

### Building & Testing

```bash
cd auth-service
./mvnw clean package    # Build
./mvnw test             # Run tests
```

## Business App Backend (`business-app-backend/`)

A comprehensive full-stack business application template with Spring Boot backend and React frontend.

### Tech Stack
- **Backend**: Spring Boot 3.4.0, Java 17, Spring Security, Spring Data JPA
- **Frontend**: React 19.2, TypeScript, Vite, Material-UI v7
- **Database**: H2 (dev), Oracle (prod)
- **Authentication**: JWT-based stateless authentication
- **API Documentation**: SpringDoc OpenAPI (Swagger)

### Important Design: Demo vs Real Code Separation

**Demo Package** (`com.template.business.demo`):
- Example entities, controllers, services for demonstration
- Table name: `demo_products` (isolated from real data)
- **Safe to delete** when starting real development
- Includes DemoProduct entity with full CRUD operations

**Real Business Packages**:
- `entity/`, `repository/`, `service/`, `controller/` - Ready for real business logic
- Currently contains User entity and authentication services
- Demo code does NOT pollute these packages

### Running Business App

```bash
cd business-app-backend

# Backend only (port 8080)
./mvnw spring-boot:run

# Frontend only (port 5173)
cd frontend
npm install
npm run dev

# Build frontend for production (outputs to src/main/resources/static/)
cd frontend
npm run build

# Full production build (backend + frontend)
./mvnw clean package
java -jar target/business-app-backend-1.0.0.jar
```

### Access Points
- Backend API: http://localhost:8090/api
- Frontend Dev: http://localhost:5173
- H2 Console: http://localhost:8090/api/h2-console
  - JDBC URL: `jdbc:h2:mem:businessdb`
  - Username: `sa`
  - Password: (empty)
- Swagger UI: http://localhost:8090/api/swagger-ui.html

### Sample Users (Dev)
- Admin: admin@example.com / admin123 (username: admin)
- Regular User: user@example.com / user123 (username: user)
- Users with MANAGER role: jane.smith@example.com / password123 (username: jane.smith)
- Other test users: john.doe@example.com, bob.wilson@example.com (password: password123)

### Key Frontend Features

**AdvancedDataTable Component** (`frontend/src/components/table/AdvancedDataTable.tsx`):
- Server-side pagination, filtering, sorting
- Inline editing with save/cancel
- Bulk editing (edit multiple rows, save all at once)
- Date range filtering
- Export to CSV/Excel

**CRITICAL for Performance:**
- Always wrap `columns` array in `useMemo`
- Wrap callbacks (`onFetchData`, `onSave`, `onBulkSave`) in `useCallback`
- Move helper functions outside component to prevent recreation

**Date/Timestamp Formatting** (`frontend/src/context/DateFormatContext.tsx`):
- User-configurable date and timestamp formats
- Available formats:
  - Date: DD.MM.YYYY (default), MM/DD/YYYY, YYYY-MM-DD
  - Timestamp: DD.MM.YYYY HH:mm:ss (default), MM/DD/YYYY HH:mm:ss, YYYY-MM-DD HH:mm:ss
- Usage: `const { formatDate, formatTimestamp } = useDateFormat();`

**Theme System** (`frontend/src/theme/ThemeContext.tsx`, `frontend/src/types/palette.ts`):
- Dark mode toggle
- Predefined palettes: Ocean Blue, Sunset Orange, Forest Green, Royal Purple, Cherry Red, Midnight Dark
- Custom palettes (user-created, stored in localStorage)

### API Patterns

**SearchRequest Pattern (Backend):**
```java
@PostMapping("/search")
public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> search(@RequestBody SearchRequest request) {
    PageResponse<ProductDTO> response = productService.search(request);
    return ResponseEntity.ok(ApiResponse.success(response));
}
```

**Dynamic Filtering with Specifications:**
- Uses `SpecificationBuilder` for dynamic JPA queries
- Supports text filters (case-insensitive partial match)
- Supports number filters (exact match)
- Supports date range filters (from/to)
- Supports sorting by any column
- Supports pagination

**API Response Wrapper:**
All responses use `ApiResponse<T>` wrapper for consistency:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Building & Testing

```bash
cd business-app-backend

# Run tests
./mvnw test

# Build backend only
./mvnw clean package -Dmaven.test.skip=true

# Full build (backend + frontend)
./mvnw clean package
```

### Creating New Entities

When adding real business entities:

1. **Create entity** in `entity/` extending `BaseEntity` (provides createdAt, updatedAt, createdBy, modifiedBy)
2. **Create repository** in `repository/` extending `JpaRepository` and `JpaSpecificationExecutor`
3. **Create DTOs** in `dto/` for request/response
4. **Create service** in `service/` using `SearchRequest` pattern
5. **Create controller** in `controller/` with `@PreAuthorize` for role-based access
6. **Create frontend page** in `pages/` using `AdvancedDataTable`

**Remember:**
- Use `formatTimestamp` from DateFormatContext for all timestamp displays
- Use `useMemo`/`useCallback` for AdvancedDataTable props
- Extend `BaseEntity` for automatic auditing

### Optional: Deleting Demo Code

When ready for production:
```bash
cd business-app-backend
rm -rf src/main/java/com/template/business/demo/
# Also remove demo route from frontend/src/App.tsx
# Also remove "Demo Products" from frontend/src/components/layout/Sidebar.tsx
```

## Common Commands

### Maven Commands (Backend)

```bash
# Run application
./mvnw spring-boot:run

# Clean and build
./mvnw clean package

# Run tests
./mvnw test

# Skip tests during build
./mvnw clean package -Dmaven.test.skip=true

# Run specific test class
./mvnw test -Dtest=YourTestClass

# Clean install (install to local Maven repo)
./mvnw clean install
```

### NPM Commands (Frontend)

```bash
cd business-app-backend/frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Integration Patterns

### Integrating Auth Service with Business App

1. Update business app login to call auth-service:
   ```
   POST http://localhost:8091/auth/api/v1/auth/login
   ```

2. Use returned JWT token in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

3. Response includes all user details and roles:
   ```json
   {
     "token": "eyJhbG...",
     "username": "admin",
     "roles": ["ADMIN"],
     "authenticationMethod": "LDAP"
   }
   ```

## Database Configuration

### Switching to Production Database

Both applications support Oracle for production. Update `application.properties` or use environment variables:

**PostgreSQL:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/yourdb
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**MySQL:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/yourdb
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

Add dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Security Notes

- **JWT Secret**: Change `jwt.secret` in production (both applications)
- **LDAPS**: Use secure LDAPS (ldaps://) for production LDAP connections
- **CORS**: Configure `cors.allowed-origins` for your production frontend URLs
- **Database Passwords**: Use environment variables, never hardcode
- **H2 Console**: Disable in production (`spring.h2.console.enabled=false`)

## Project Generation

The `business-app-backend` includes scripts to generate new projects:
- `./create-new-project.sh` (Bash - Linux/Mac)
- `node create-project.js` (Node.js - Cross-platform)

These scripts create new projects with custom names, updating all package names and configurations.

## Reference Documentation

Each application has detailed README files:
- `auth-service/README.md` - Authentication service documentation
- `business-app-backend/README.md` - Business app backend documentation
- `business-app-backend/claude.md` - Detailed session notes and patterns
- `business-app-backend/TEMPLATE_README.md` - Template generation guide

## Integration Architecture Documentation (Hrvatski)

Comprehensive documentation for building OSB-replacement integration systems using Spring Boot:

📚 **[INTEGRACIJE_README.md](./INTEGRACIJE_README.md)** - Start here for overview and navigation

**Detailed Documentation:**
- **[INTEGRACIJE.md](./INTEGRACIJE.md)** (Dio 1) - Uvod, arhitektura, pregled sustava
  - Integracijske potrebe
  - TRC-STG model (Tracing-Staging)
  - Arhitektura sustava i komponente
  - Error handling i logging strategije
  - Scheduling i polling mehanizam

- **[INTEGRACIJE_DIO2.md](./INTEGRACIJE_DIO2.md)** (Dio 2) - Spring Boot implementacija
  - Controllers, Services, Repositories
  - DTO i validacija
  - Exception handling
  - Kod primjeri i best practices

- **[INTEGRACIJE_DIO3.md](./INTEGRACIJE_DIO3.md)** (Dio 3) - Deployment i održavanje
  - Docker i Kubernetes deployment
  - Testing strategije (Unit, Integration, Performance)
  - Swagger/OpenAPI dokumentacija
  - Monitoring i troubleshooting

- **[INTEGRACIJE_SQL_SKRIPTE.md](./INTEGRACIJE_SQL_SKRIPTE.md)** - Database setup
  - TRC i STG tablice (DDL)
  - Oracle packages (TAFR - Transform And Forward)
  - Split logika i business pravila
  - Testni podatci i monitoring queries

**Use Case:** Asinkrona integracija između sustava putem baze podataka, zamjena za Oracle Service Bus (OSB)

## Known Limitations

- **H2 Database**: Both applications use H2 for development - switch to PostgreSQL/MySQL/Oracle for production
- **Frontend Bundle Size**: Business app frontend is ~1.27 MB (384 KB gzipped) - could be optimized with code splitting
- **JWT Expiration**: Currently set to 24 hours - adjust as needed
