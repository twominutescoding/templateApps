# Environment Variables Guide

This document lists all environment variables used in the template applications and explains how they change when project generation scripts are run.

## Environment Variable Naming Convention

All environment variables are prefixed with the **entity name** to support multi-application Tomcat deployments. This allows multiple applications to run on the same Tomcat instance without variable name collisions.

**Template Format:** `[ENTITY_PREFIX]_[VARIABLE_NAME]`

For example:
- `TEMP_AUTH_SERVICE_JWT_SECRET` - JWT secret for auth-service
- `TEMP_BUSINESS_APP_JWT_SECRET` - JWT secret for business-app

---

## Auth Service Environment Variables

### Template Prefix: `TEMP_AUTH_SERVICE`

When you run `create-auth-project.js`, the prefix `TEMP_AUTH_SERVICE` is replaced with your chosen entity code (e.g., `MY_AUTH` becomes `MY_AUTH_JWT_SECRET`).

### Database Configuration (Test/Prod Profiles)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_AUTH_SERVICE_DB_HOST` | Oracle database host | `localhost` | Yes (test/prod) |
| `TEMP_AUTH_SERVICE_DB_PORT` | Oracle database port | `1521` | No |
| `TEMP_AUTH_SERVICE_DB_SID` | Oracle database SID | `ORCL` | Yes (test/prod) |
| `TEMP_AUTH_SERVICE_DB_USERNAME` | Database username | `your_username` | Yes (test/prod) |
| `TEMP_AUTH_SERVICE_DB_PASSWORD` | Database password | `your_password` | Yes (test/prod) |

### JWT Configuration (Prod Profile)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_AUTH_SERVICE_JWT_SECRET` | JWT signing secret (64 bytes recommended) | None | **Yes (prod)** |
| `TEMP_AUTH_SERVICE_JWT_ACCESS_EXPIRATION` | Access token expiration (ms) | `900000` (15 min) | No |
| `TEMP_AUTH_SERVICE_JWT_REFRESH_EXPIRATION` | Refresh token expiration (ms) | `86400000` (24 hrs) | No |

### Session Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_AUTH_SERVICE_SESSION_MAX_PER_USER` | Max concurrent sessions per user | `5` | No |

### LDAP Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_AUTH_SERVICE_LDAP_ENABLED` | Enable LDAP authentication | `true` (prod), `false` (dev) | No |
| `TEMP_AUTH_SERVICE_LDAP_URL` | LDAP server URL | `ldaps://ldap.example.com:636` | Yes (if LDAP enabled) |
| `TEMP_AUTH_SERVICE_LDAP_BASE` | LDAP base domain | `example.local` | Yes (if LDAP enabled) |
| `TEMP_AUTH_SERVICE_LDAP_USER_SEARCH_FILTER` | LDAP search filter | `(&(objectClass=user)(sAMAccountName={1}))` | No |

### CORS Configuration (Common Properties)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_AUTH_SERVICE_CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,...` | No |

---

## Business App Environment Variables

### Template Prefix: `TEMP_BUSINESS_APP`

When you run `create-project.js`, the prefix `TEMP_BUSINESS_APP` is replaced with your chosen entity code (e.g., `INVENTORY_MGMT` becomes `INVENTORY_MGMT_JWT_SECRET`).

### Database Configuration (Test/Prod Profiles)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_BUSINESS_APP_DB_HOST` | Oracle database host | `localhost` | Yes (test/prod) |
| `TEMP_BUSINESS_APP_DB_PORT` | Oracle database port | `1521` | No |
| `TEMP_BUSINESS_APP_DB_SID` | Oracle database SID | `ORCL` | Yes (test/prod) |
| `TEMP_BUSINESS_APP_DB_USERNAME` | Database username | `your_username` | Yes (test/prod) |
| `TEMP_BUSINESS_APP_DB_PASSWORD` | Database password | `your_password` | Yes (test/prod) |

### JWT Configuration (Prod Profile)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_BUSINESS_APP_JWT_SECRET` | JWT signing secret (must match auth-service) | Dev secret | **Yes (prod)** |
| `TEMP_BUSINESS_APP_JWT_EXPIRATION` | Token expiration (ms) | `900000` (15 min) | No |

### Auth Service Connection (Common Properties)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_BUSINESS_APP_AUTH_SERVICE_URL` | Auth service login URL | `http://localhost:8091/auth/api/v1/auth/login` | No |
| `TEMP_BUSINESS_APP_AUTH_SERVICE_REFRESH_URL` | Auth service refresh URL | `http://localhost:8091/auth/api/v1/auth/refresh` | No |
| `TEMP_BUSINESS_APP_AUTH_SERVICE_LOG_URL` | Auth service logging URL | `http://localhost:8091/auth/api/v1/logs` | No |

### Application Logging (Common Properties)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_BUSINESS_APP_LOGGING_ENTITY_NAME` | Entity name for logging | `TEMP_BUSINESS_APP` | No |
| `TEMP_BUSINESS_APP_LOGGING_CREATE_USER` | Service identifier in logs | `business-app-backend` | No |
| `TEMP_BUSINESS_APP_LOGGING_ENABLED` | Enable remote logging | `true` | No |

### CORS Configuration (Common Properties)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TEMP_BUSINESS_APP_CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` | No |

---

## Script Replacements Summary

### `auth-service/create-auth-project.js`

When you run this script, the following configuration values change based on your input:

| Configuration | Template Value | Replaced With |
|---------------|----------------|---------------|
| Package name | `com.template.business.auth` | Your base package + service name |
| Service name | `auth-service` | Your service name (kebab-case) |
| Display name | `Authentication Service` | Your display name |
| Database name | `authdb` | Your database name |
| Server port | `8091` | Your server port |
| Context path | `/auth` | Your context path |
| **Env var prefix** | `TEMP_AUTH_SERVICE` | Your entity code |
| JWT secret | Dev secret | Generated secret (optional) |
| Logging package | `com.template.business` | Your base package |
| Maven groupId | `com.template` | Your base package |
| Maven artifactId | `auth-service` | Your service name |

### `business-app-backend/create-project.js`

When you run this script, the following configuration values change based on your input:

| Configuration | Template Value | Replaced With |
|---------------|----------------|---------------|
| Package name | `com.template.business` | Your base package + project name |
| Project name | `business-app-backend` | Your project name (kebab-case) |
| Display name | `Business App Template` | Your display name |
| Database name | `businessdb` | Your database name |
| Server port | `8090` | Your server port |
| Context path | `/api` | Your context path |
| **Env var prefix** | `TEMP_BUSINESS_APP` | Your entity code |
| Auth service URL | `http://localhost:8091/auth/api/v1/auth/login` | Your auth service URL |
| JWT secret | Dev secret | Generated secret (optional) |
| Logging package | `com.template.business` | Your base package |
| Maven groupId | `com.template` | Your base package |
| Maven artifactId | `business-app-backend` | Your project name |

---

## IntelliJ IDEA Run Configurations

Pre-configured run configurations are available in `.idea/runConfigurations/`:

### Auth Service

- **AuthService (Dev)** - H2 database, LDAP disabled
- **AuthService (Test)** - Oracle database with placeholder credentials
- **AuthService (Prod)** - Oracle database, LDAP enabled, requires JWT secret

### Business App

- **BusinessApp (Dev)** - H2 database
- **BusinessApp (Test)** - Oracle database with placeholder credentials
- **BusinessApp (Prod)** - Oracle database, requires JWT secret

---

## Multi-App Tomcat Deployment Example

When deploying multiple applications on a single Tomcat instance, set environment variables with unique prefixes:

```bash
# Auth Service
export USER_AUTH_JWT_SECRET=your_jwt_secret_here
export USER_AUTH_DB_HOST=db.example.com
export USER_AUTH_DB_USERNAME=auth_user
export USER_AUTH_DB_PASSWORD=auth_pass

# Inventory Management App
export INVENTORY_MGMT_JWT_SECRET=your_jwt_secret_here
export INVENTORY_MGMT_DB_HOST=db.example.com
export INVENTORY_MGMT_DB_USERNAME=inv_user
export INVENTORY_MGMT_DB_PASSWORD=inv_pass

# Order Processing App
export ORDER_PROC_JWT_SECRET=your_jwt_secret_here
export ORDER_PROC_DB_HOST=db.example.com
export ORDER_PROC_DB_USERNAME=order_user
export ORDER_PROC_DB_PASSWORD=order_pass
```

Each application reads only its prefixed variables, preventing conflicts.

---

## Generating JWT Secret

Generate a secure 64-byte secret:

```bash
# Using OpenSSL
openssl rand -base64 64

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important:** The JWT secret in business-app **must match** the auth-service secret for token validation to work.
