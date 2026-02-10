# Authentication Service

A Spring Boot 4.0.1 microservice providing centralized authentication with Active Directory LDAP and database fallback support.

## Features

- **Spring Boot 4.0.1** - Latest Spring Boot with enhanced modularization and Java 17+ support
- **Dual Authentication Strategy**: Active Directory LDAP with database fallback
- **JWT Token-based Authentication** with HS256 algorithm (JJWT 0.12.6)
- **User Registration** with BCrypt password encryption
- **Role-based Access Control** with multi-entity support
- **Multi-application Support** (entity-based role filtering)
- **H2 Database (Development)** with auto-initialization
- **Oracle Database (Production)** support
- **SpringDoc OpenAPI 2.8.14** - Spring Boot 4.0 compatible API documentation
- **Comprehensive JavaDoc Documentation**

## Authentication Flow

1. **Active Directory LDAP Enabled**:
   - Attempts AD LDAP authentication first
   - If LDAP succeeds → Loads roles from database → Returns JWT token with `authenticationMethod: "LDAP"`
   - If LDAP fails → Falls back to database authentication → Returns JWT token with `authenticationMethod: "DATABASE"`

2. **LDAP Disabled**:
   - Uses database authentication only
   - Returns JWT token with `authenticationMethod: "DATABASE"`

3. **Both Methods Fail**: Returns "Invalid username or password" error

**Important**: Roles are **ALWAYS** loaded from the database, regardless of authentication method. LDAP is used only for password validation.

## Endpoints

### Authentication

- `POST /auth/api/v1/auth/login` - User login
- `POST /auth/api/v1/auth/register` - User registration
- `GET /auth/api/v1/auth/validate` - Validate JWT token
- `GET /auth/api/v1/auth/health` - Health check

### Login Request Format
```json
{
  "username": "admin",
  "password": "password",
  "applicationCode": "APP001"  
}
```

### Login Response Format
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "department": "IT",
    "theme": "dark",
    "image": null,
    "roles": ["ADMIN"],
    "authenticationMethod": "DATABASE"
  }
}
```

## Configuration

### Development Profile (H2 Database)
```bash
# Default profile - runs on port 8091 with H2 in-memory database
./mvnw spring-boot:run
```

### Test Profile (Oracle Database)
```bash
# Test profile - Oracle DB with dev-like debugging enabled
export SPRING_PROFILES_ACTIVE=test
export DB_HOST=localhost
export DB_PORT=1521
export DB_SID=TESTDB
export DB_USERNAME=test_user
export DB_PASSWORD=test_password

./mvnw spring-boot:run
```

**Test Profile Features:**
- Oracle database (like production)
- Debug logging enabled (like development)
- SQL logging and formatting enabled
- LDAP disabled by default (use database authentication)
- Hibernate DDL mode: `update` (automatically updates schema)

### Production Profile (Oracle Database)
```bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=localhost
export DB_PORT=1521
export DB_SID=ORCL
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
export LDAP_ENABLED=true
export LDAP_URL=ldap://your-ldap-server:389
export LDAP_BASE=dc=example,dc=com

./mvnw spring-boot:run
```

## Active Directory LDAP Configuration

### For Production (Active Directory)

Set the following environment variables to enable AD LDAP:

```bash
export LDAP_ENABLED=true
export LDAP_URL=ldaps://fng.local:636              # LDAPS for secure connection
export LDAP_BASE=fng.local                         # Your AD domain
export LDAP_USER_SEARCH_FILTER="(&(objectClass=user)(sAMAccountName={1}))"  # AD user search
```

### Configuration Properties

- `ldap.enabled` - Enable/disable LDAP authentication (default: false)
- `ldap.url` - LDAP server URL (use ldaps:// for secure connection)
- `ldap.base` - Active Directory domain (e.g., fng.local)
- `ldap.userSearchFilter` - AD search filter (default: `(&(objectClass=user)(sAMAccountName={1}))`)

### How It Works

The service uses `ActiveDirectoryLdapAuthenticationProvider` which simplifies Active Directory integration:
- Authenticates users against AD using sAMAccountName (Windows username)
- Validates passwords via LDAP bind
- Ignores AD groups/authorities
- Loads roles from local database for authorization

## Sample Users (Development)

Sample users are loaded automatically via `DataInitializer` (dev profile only):

| Username | Password | Roles |
|----------|----------|-------|
| admin | password | ADMIN (APP001, APP002) |
| user1 | password | USER, MANAGER (APP001) |
| user2 | password | USER (APP001, APP002) |

**Note**: Sample data only loads in `dev` profile. In production, users must be registered via `/api/v1/auth/register` or imported from your existing database.

## Integration with Business App

The response format is compatible with your business application. To integrate:

1. Update your business app's login to call this service:
   ```
   POST http://localhost:8091/auth/api/v1/auth/login
   ```

2. Use the returned JWT token in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

3. The response includes all user details and roles needed by your application.

## Database Schema

### Users Table
- username (PK)
- password (BCrypt encoded)
- first_name, last_name
- email
- department
- status (ACTIVE, INACTIVE, LOCKED)
- theme, image
- created_date, created_by
- modified_date, modified_by

### Roles Table
- role_name, application_code (Composite PK)
- description
- status
- created_date, created_by

### User_Roles Table
- username, role_name, application_code (Composite PK)
- status
- created_date, created_by

## Building

```bash
./mvnw clean package
```

## Running

```bash
./mvnw spring-boot:run
```

## Environment Variables Template

A template file `ENV_TEMPLATE.env` is provided with all environment variables needed for deployment.

### Usage

Copy the template to your deployment environment:

```bash
# For Tomcat - add to setenv.sh (Linux) or setenv.bat (Windows)
cat ENV_TEMPLATE.env >> $CATALINA_HOME/bin/setenv.sh

# For IntelliJ IDEA - copy to Run Configuration environment variables
```

### Key Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (dev/test/prod) | dev |
| `{ENTITY}_DB_HOST` | Oracle database host | localhost |
| `{ENTITY}_DB_PORT` | Oracle database port | 1521 |
| `{ENTITY}_DB_SID` | Oracle SID | ORCL |
| `{ENTITY}_DB_USERNAME` | Database username | - |
| `{ENTITY}_DB_PASSWORD` | Database password | - |
| `{ENTITY}_JWT_SECRET` | JWT signing secret (required in prod) | - |
| `{ENTITY}_LDAP_ENABLED` | Enable LDAP authentication | false |
| `{ENTITY}_LDAP_URL` | LDAP server URL | - |
| `{ENTITY}_LDAP_BASE` | LDAP base domain | - |

**Note**: Variables are prefixed with entity code (e.g., `MY_APP_DB_HOST`) for multi-app Tomcat deployment support.

## API Documentation

### Swagger UI URLs

- **Swagger UI:** http://localhost:8091/auth/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8091/auth/v3/api-docs
- **Custom API Docs:** http://localhost:8091/auth/api-docs

### Customizing API Documentation

You can customize the API documentation in `application.properties`:

```properties
# API metadata (optional)
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
```

## H2 Console (Development Only)

Access at: http://localhost:8091/auth/h2-console
- JDBC URL: jdbc:h2:mem:authdb
- Username: sa
- Password: (empty)

## Admin Frontend

A React-based admin panel is available in the `admin-frontend/` directory for managing users, roles, and sessions.

### Features
- **Dashboard**: View user and session statistics
- **User Management**: Create, edit, and manage user accounts and roles
- **Role Management**: Create and manage roles across entities
- **Session Management**: Monitor and revoke active sessions
- **Dark Mode**: Toggle between light and dark themes

### Quick Start

```bash
cd admin-frontend
npm install
npm run dev
```

Admin panel will be available at: http://localhost:5174

**Login**: Use admin credentials (username: `admin`, password: `password`)

**Requirements**: Auth service must be running on port 8091

For detailed instructions, see [admin-frontend/README.md](admin-frontend/README.md)

## Documentation

Detailed documentation is available in the [`docs/`](docs/) folder:

- **[Refresh Token Implementation](docs/REFRESH_TOKEN_IMPLEMENTATION.md)** - Refresh token flow and configuration
- **[Admin Endpoints](docs/ADMIN_ENDPOINTS.md)** - Admin user management endpoints
- **[JWT Filter Implementation](docs/JWT_FILTER_IMPLEMENTATION.md)** - JWT validation and security
- **[Exception Handling](docs/EXCEPTION_HANDLING.md)** - Error handling architecture
- **[Exception Migration Guide](docs/EXCEPTION_MIGRATION_GUIDE.md)** - Migrating to custom exceptions
- **[Improvements](docs/IMPROVEMENTS.md)** - Suggested enhancements and roadmap
