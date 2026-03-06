# Authentication Service

A Spring Boot 4.0.1 microservice providing centralized authentication with Active Directory LDAP and database fallback support.

## Features

- **Spring Boot 4.0.1** - Latest Spring Boot with enhanced modularization and Java 17+ support
- **Dual Authentication Strategy**: Active Directory LDAP with database fallback
- **JWT Token-based Authentication** with HS256 algorithm (JJWT 0.12.6)
- **Refresh Tokens**: 24-hour expiration (default, configurable) with automatic token rotation
- **Session Management**: Device tracking, concurrent session limits, revocation
- **User Registration** with BCrypt password encryption
- **Role-based Access Control** with multi-entity support
- **Multi-application Support** (entity-based role filtering)
- **Oracle Database** support (test and prod profiles)
- **SpringDoc OpenAPI 2.8.14** - Spring Boot 4.0 compatible API documentation
- **React 19 Admin Panel** for user, role, entity, and session management

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

## API Endpoints

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/api/v1/auth/login` | User login — returns access token + refresh token |
| `POST` | `/auth/api/v1/auth/register` | User registration |
| `GET`  | `/auth/api/v1/auth/validate` | Validate JWT token |
| `GET`  | `/auth/api/v1/auth/health` | Health check |
| `GET`  | `/auth/api/v1/auth/healthDB` | Database connectivity check (requires auth) |

### Session Management

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/api/v1/auth/refresh` | Refresh access token (old token rotated) |
| `POST` | `/auth/api/v1/auth/logout` | Logout (revoke refresh token) |
| `POST` | `/auth/api/v1/auth/logout-all` | Logout from all devices |
| `GET`  | `/auth/api/v1/auth/sessions` | Get current user's active sessions |
| `POST` | `/auth/api/v1/auth/sessions/revoke` | Revoke a specific session |

### Admin Endpoints (ADMIN role required)

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/auth/api/v1/auth/admin/stats/dashboard` | Dashboard statistics |
| `GET`  | `/auth/api/v1/auth/admin/sessions` | View all active sessions |
| `POST` | `/auth/api/v1/auth/admin/sessions/revoke` | Revoke any session |
| `POST` | `/auth/api/v1/auth/admin/users/{username}/logout` | Force logout a user |
| `GET`  | `/auth/api/v1/admin/users` | List all users |
| `GET`  | `/auth/api/v1/admin/users/{username}` | Get user details |
| `PUT`  | `/auth/api/v1/admin/users/{username}` | Update user |
| `PUT`  | `/auth/api/v1/admin/users/{username}/status` | Change user status |
| `GET`  | `/auth/api/v1/admin/users/{username}/roles` | Get user roles |
| `POST` | `/auth/api/v1/admin/users/{username}/roles` | Assign role to user |
| `DELETE` | `/auth/api/v1/admin/users/{username}/roles/{role}/entity/{entity}` | Remove role |
| `GET`  | `/auth/api/v1/admin/roles` | List all roles |
| `POST` | `/auth/api/v1/admin/roles` | Create role |
| `PUT`  | `/auth/api/v1/admin/roles/{role}/entity/{entity}` | Update role |
| `DELETE` | `/auth/api/v1/admin/roles/{role}/entity/{entity}` | Delete role |

### Login Request / Response

**Request:**
```json
{
  "username": "admin",
  "password": "password",
  "entityCode": "APP001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "type": "Bearer",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["ADMIN"],
    "authenticationMethod": "DATABASE"
  }
}
```

## Configuration

### Running the Application

```bash
cd auth-service

# Development (port 8091)
./mvnw spring-boot:run

# Production (Oracle + LDAP)
export SPRING_PROFILES_ACTIVE=prod
export TEMP_AUTH_SERVICE_DB_URL=jdbc:oracle:thin:@localhost:1521:ORCL
export TEMP_AUTH_SERVICE_DB_USERNAME=your_username
export TEMP_AUTH_SERVICE_DB_PASSWORD=your_password
export TEMP_AUTH_SERVICE_JWT_SECRET=your-64-byte-secret-here
export TEMP_AUTH_SERVICE_LDAP_ENABLED=true
export TEMP_AUTH_SERVICE_LDAP_URL=ldaps://your-ldap-server:636
export TEMP_AUTH_SERVICE_LDAP_BASE=your.domain.local
./mvnw spring-boot:run
```

**Note:** All environment variables are prefixed with the entity name (e.g., `TEMP_AUTH_SERVICE_`) for multi-app Tomcat deployment. See [ENVIRONMENT_VARIABLES.md](../ENVIRONMENT_VARIABLES.md) for the full variable list.

### Key Configuration Properties

```properties
# JWT
jwt.access.expiration=900000           # 15 minutes
jwt.refresh.expiration=86400000        # 24 hours (default)

# Session
session.max-per-user=5                 # Max concurrent sessions

# LDAP (disabled by default)
ldap.enabled=false
```

## Active Directory LDAP Configuration

### For Production (Active Directory)

```bash
export TEMP_AUTH_SERVICE_LDAP_ENABLED=true
export TEMP_AUTH_SERVICE_LDAP_URL=ldaps://fng.local:636          # LDAPS for secure connection
export TEMP_AUTH_SERVICE_LDAP_BASE=fng.local                     # Your AD domain
export TEMP_AUTH_SERVICE_LDAP_USER_SEARCH_FILTER="(&(objectClass=user)(sAMAccountName={1}))"
```

The service uses `ActiveDirectoryLdapAuthenticationProvider`:
- Authenticates against AD using `sAMAccountName` (Windows username)
- Validates passwords via LDAP bind, ignores AD groups
- Roles are always loaded from the local database

## Sample Users (Development)

Sample users are loaded automatically via `DataInitializer` in the dev profile:

| Username | Password | Roles |
|----------|----------|-------|
| admin | password | ADMIN (APP001, APP002) |
| user1 | password | USER, MANAGER (APP001) |
| user2 | password | USER (APP001, APP002) |

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | User accounts (username PK, BCrypt passwords) |
| `roles` | Roles with application_code (composite PK: role_name, application_code) |
| `user_roles` | User-role associations (composite PK: username, role_name, application_code) |
| `application_entity` | Applications/entities that can be accessed |
| `entity_type` | Types of entities |
| `entity_attribute` | Entity attributes/metadata |
| `refresh_token` | JWT refresh tokens for session management |
| `t_mailing` | Email/notification queue |
| `user_status` | User status definitions |

## Admin Frontend

A React 19 admin panel in `admin-frontend/` for managing users, roles, entities, and sessions.

### Features

- **Dashboard** - User and session statistics
- **Users** - View, edit, activate/deactivate user accounts and roles
- **Roles** - Create and manage roles across entities
- **Entities** - Manage application entities and attributes
- **Sessions** - Monitor and revoke active sessions (all users, admin view)
- **Mailings** - Read-only view of the email notification queue
- **Mailing Lists** - Manage mailing list configurations
- **Logs** - View application log entries
- **Instructions** - In-app documentation and help
- **Settings** - Theme, date format, dark mode

### Running Admin Frontend

```bash
cd auth-service/admin-frontend
npm install
npm run dev
# Starts on http://localhost:5174
```

**Login**: Use admin credentials (`admin` / `password`)

**Requirements**: Auth service must be running on port 8091

For detailed documentation, see [admin-frontend/README.md](admin-frontend/README.md) and [docs/ADMIN_FRONTEND.md](docs/ADMIN_FRONTEND.md).

## Building & Deploying

```bash
cd auth-service

# Run tests
./mvnw test

# Build WAR
./mvnw clean package

# Build without tests
./mvnw clean package -Dmaven.test.skip=true

# Deploy: copy auth.war to Tomcat webapps/
cp target/auth.war $CATALINA_HOME/webapps/
```

## Production Deployment

### Pre-Deployment Checklist

**Required environment variables:**

| Variable | Description |
|----------|-------------|
| `TEMP_AUTH_SERVICE_DB_URL` | Full JDBC URL (e.g., `jdbc:oracle:thin:@host:1521:SID`) |
| `TEMP_AUTH_SERVICE_DB_USERNAME` | Database username |
| `TEMP_AUTH_SERVICE_DB_PASSWORD` | Database password |
| `TEMP_AUTH_SERVICE_JWT_SECRET` | Strong secret key (64+ chars) — generate with `openssl rand -base64 64` |

**LDAP (if using Active Directory):**

| Variable | Description |
|----------|-------------|
| `TEMP_AUTH_SERVICE_LDAP_ENABLED` | `true` |
| `TEMP_AUTH_SERVICE_LDAP_URL` | `ldaps://ldap.example.com:636` (always use ldaps://) |
| `TEMP_AUTH_SERVICE_LDAP_BASE` | AD domain (e.g., `example.local`) |

**Optional:**

| Variable | Default | Description |
|----------|---------|-------------|
| `TEMP_AUTH_SERVICE_JWT_ACCESS_EXPIRATION` | `900000` | Access token lifetime (ms) |
| `TEMP_AUTH_SERVICE_JWT_REFRESH_EXPIRATION` | `86400000` | Refresh token lifetime (ms, 24h) |
| `TEMP_AUTH_SERVICE_SESSION_MAX_PER_USER` | `5` | Max concurrent sessions |
| `TEMP_AUTH_SERVICE_CORS_ORIGINS` | `http://localhost:5173,...` | Allowed CORS origins |

### Security Checklist

- [ ] `TEMP_AUTH_SERVICE_JWT_SECRET` set via environment variable (no default in prod!)
- [ ] Database credentials set via environment variables (never hardcoded)
- [ ] `TEMP_AUTH_SERVICE_CORS_ORIGINS` configured for specific frontend URLs (not wildcards)
- [ ] **LDAPS** (`ldaps://`) used instead of plain LDAP for encrypted connections
- [ ] Debug and SQL logging are disabled (automatically in prod profile)

### Required Tables

Verify all tables exist before deployment (prod profile uses `hibernate.ddl-auto=validate`):
`users`, `roles`, `user_roles`, `application_entity`, `entity_type`, `entity_attribute`, `refresh_token`, `t_mailing`, `user_status`

### Post-Deployment Verification

- [ ] Health endpoint responds: `GET /auth/api/v1/auth/health`
- [ ] Database check: `GET /auth/api/v1/auth/healthDB` (with valid JWT)
- [ ] Login works with valid credentials
- [ ] Token refresh works
- [ ] Admin panel accessible at `http://your-host/auth/`

### Monitoring Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/auth/api/v1/auth/health` | Basic health check |
| `/auth/api/v1/auth/healthDB` | Database connectivity (requires auth) |

## Access Points

- API: http://localhost:8091/auth/api/v1/auth
- Swagger UI: http://localhost:8091/auth/swagger-ui.html
- OpenAPI Docs: http://localhost:8091/auth/v3/api-docs

## Integration with Business App

1. Business app login calls this service:
   ```
   POST http://localhost:8091/auth/api/v1/auth/login
   ```

2. Use the returned JWT token in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

3. On token expiry, call refresh endpoint:
   ```
   POST http://localhost:8091/auth/api/v1/auth/refresh
   {"refreshToken": "<refresh_token>"}
   ```

## Documentation

- **[Admin Frontend](docs/ADMIN_FRONTEND.md)** - Admin panel implementation details
- **[Exception Handling](docs/EXCEPTION_HANDLING.md)** - Error handling architecture
- **[Improvements](docs/IMPROVEMENTS.md)** - Suggested enhancements and roadmap
- **[Environment Variables](../ENVIRONMENT_VARIABLES.md)** - Full variable reference
