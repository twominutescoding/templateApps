# Production Deployment Checklist

This checklist covers all the steps needed to deploy the auth-service to production safely.

## Pre-Deployment

### Environment Variables (REQUIRED)

Before deploying, ensure these environment variables are set:

| Variable | Description | Example |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Must be `prod` | `prod` |
| `JWT_SECRET` | Strong secret key (64+ chars) | Generate with: `openssl rand -base64 64` |
| `DB_HOST` | Oracle database host | `oracle.example.com` |
| `DB_PORT` | Oracle database port | `1521` |
| `DB_SID` | Oracle SID | `PROD` |
| `DB_USERNAME` | Database username | `auth_service` |
| `DB_PASSWORD` | Database password | (secure password) |
| `CORS_ORIGINS` | Allowed frontend origins | `https://admin.example.com` |

### LDAP Configuration (if using Active Directory)

| Variable | Description | Example |
|----------|-------------|---------|
| `LDAP_ENABLED` | Enable LDAP auth | `true` |
| `LDAP_URL` | LDAP server URL (use ldaps://) | `ldaps://ldap.example.com:636` |
| `LDAP_BASE` | Active Directory domain | `example.local` |
| `LDAP_USER_SEARCH_FILTER` | User search filter | `(&(objectClass=user)(sAMAccountName={1}))` |

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_ACCESS_EXPIRATION` | Access token lifetime (ms) | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION` | Refresh token lifetime (ms) | `86400000` (24 hours) |
| `SESSION_MAX_PER_USER` | Max concurrent sessions | `5` |

## Security Checklist

- [ ] **JWT_SECRET** is set via environment variable (no default in prod!)
- [ ] **Database credentials** are set via environment variables
- [ ] **CORS_ORIGINS** is configured for your specific frontend URLs (not wildcards)
- [ ] **LDAPS** (ldaps://) is used instead of LDAP (ldap://) for encrypted connections
- [ ] **H2 console** is disabled (automatically in prod profile)
- [ ] **Debug logging** is disabled (automatically in prod profile)
- [ ] **SQL logging** is disabled (automatically in prod profile)

## Database Preparation

1. Ensure Oracle database is accessible from the server
2. Run schema migrations if needed (prod uses `hibernate.ddl-auto=validate`)
3. Verify required tables exist:
   - `users`
   - `roles`
   - `user_roles`
   - `application_entity`
   - `entity_type`
   - `entity_attribute`
   - `refresh_token`
   - `t_mailing`
   - `user_status`

## Build & Deploy

```bash
# Build the application
cd auth-service
./mvnw clean package -Dmaven.test.skip=true

# Build admin frontend (included in JAR)
cd admin-frontend
npm install
npm run build

# Run with production profile
export SPRING_PROFILES_ACTIVE=prod
export JWT_SECRET=$(openssl rand -base64 64)
export DB_HOST=your-oracle-host
export DB_PORT=1521
export DB_SID=PROD
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
export CORS_ORIGINS=https://your-frontend-domain.com

java -jar target/auth-service-1.0.0.jar
```

## Post-Deployment Verification

- [ ] Health endpoint responds: `GET /auth/api/v1/health`
- [ ] Database connectivity: `GET /auth/api/v1/healthDB` (with valid JWT)
- [ ] Login works with valid credentials
- [ ] Token refresh works
- [ ] Admin panel accessible at `/auth/`
- [ ] Swagger UI disabled or protected in production

## Monitoring

Recommended endpoints to monitor:

| Endpoint | Purpose |
|----------|---------|
| `/auth/api/v1/health` | Basic health check |
| `/auth/api/v1/healthDB` | Database connectivity (requires auth) |

## Rollback Plan

1. Keep previous JAR version available
2. Database changes should be backward compatible
3. If issues occur, redeploy previous version

## Remaining TODOs (Lower Priority)

These items are optional improvements for hardening:

1. **Migrate remaining console.error calls** - A logger utility was created at `admin-frontend/src/utils/logger.ts`. Update remaining files to use `logError()` instead of `console.error()`.

2. **Rate limiting** - Consider adding rate limiting for login endpoints to prevent brute force attacks.

3. **IP blocking** - Consider implementing IP-based blocking after multiple failed login attempts.

4. **Audit logging** - The application logs to `T_APP_LOG` table. Ensure log retention policies are configured.

5. **SSL/TLS** - Ensure the application is behind HTTPS (terminate SSL at load balancer or configure in application).
