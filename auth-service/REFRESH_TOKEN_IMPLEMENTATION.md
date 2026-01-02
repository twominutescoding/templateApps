# Refresh Token Implementation Guide

## Overview

The auth-service now supports **refresh tokens** for enhanced security and session management. This implementation follows OAuth 2.0 best practices with token rotation and comprehensive session tracking.

## What Changed

### Security Improvements

**Before (Access Token Only):**
- Access tokens valid for 24 hours
- No way to revoke tokens (logout doesn't work)
- Stolen token valid until expiry
- No session visibility

**After (Access Token + Refresh Token):**
- Access tokens valid for **15 minutes** (short-lived)
- Refresh tokens valid for **7 days** (long-lived)
- Can revoke sessions (logout works!)
- Full session visibility and management
- Token rotation on refresh (old token auto-revoked)
- Device and location tracking

## Database Setup

### 1. Create Database Table

Run the Oracle DDL script:

```bash
sqlplus username/password@database @scripts/oracle/01_create_refresh_tokens_table.sql
```

This creates:
- `D_REFRESH_TOKENS` table
- `D_REFRESH_TOKENS_SEQ` sequence
- Indexes for performance
- Triggers for auto-increment
- Foreign key to `D_USERS`

### Table Structure

```
D_REFRESH_TOKENS
├── ID                 - Primary key (auto-generated)
├── TOKEN_HASH         - SHA-256 hash of refresh token
├── USERNAME           - User reference
├── ENTITY             - Application code (APP001, etc.)
├── CREATE_DATE        - Session start time
├── EXPIRES_AT         - Token expiration
├── LAST_USED_AT       - Last refresh timestamp
├── REVOKED            - Revocation flag (0/1)
├── REVOKED_AT         - Revocation timestamp
├── IP_ADDRESS         - Client IP address
├── USER_AGENT         - Browser/device info
├── DEVICE_NAME        - Parsed device name
├── LOCATION           - Geographic location (optional)
└── CREATE_USER        - Audit field
```

## API Changes

### Login Endpoint (Modified)

**Endpoint:** `POST /auth/api/v1/auth/login`

**New Response Format:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",           // Access token (15 min)
    "refreshToken": "550e8400-...",  // Refresh token (7 days)
    "type": "Bearer",
    "username": "john.doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["USER", "MANAGER"],
    "authenticationMethod": "LDAP"
  }
}
```

### New Endpoints

#### 1. Refresh Token

**Endpoint:** `POST /auth/api/v1/auth/refresh`

**Request:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc...",     // New access token
    "refreshToken": "660e8400-...",   // New refresh token (rotated)
    "type": "Bearer",
    "username": "john.doe",
    "roles": ["USER", "MANAGER"]
  }
}
```

**Note:** Old refresh token is automatically revoked (token rotation).

#### 2. Logout

**Endpoint:** `POST /auth/api/v1/auth/logout`

**Request:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": "success"
}
```

#### 3. Logout All Devices

**Endpoint:** `POST /auth/api/v1/auth/logout-all`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out from all devices successfully",
  "data": "success"
}
```

#### 4. Get Active Sessions

**Endpoint:** `GET /auth/api/v1/auth/sessions?refreshToken=<token>`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "message": "Sessions retrieved",
  "data": [
    {
      "sessionId": 101,
      "username": "john.doe",
      "entity": "APP001",
      "deviceName": "Chrome on Windows",
      "ipAddress": "192.168.1.50",
      "location": null,
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-02T08:00:00Z",
      "lastUsedAt": "2026-01-02T14:30:00Z",
      "expiresAt": "2026-01-09T08:00:00Z",
      "current": true,
      "revoked": false
    },
    {
      "sessionId": 102,
      "username": "john.doe",
      "entity": "APP001",
      "deviceName": "Safari on iPhone",
      "ipAddress": "10.0.0.23",
      "location": null,
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-01T18:00:00Z",
      "lastUsedAt": "2026-01-02T10:00:00Z",
      "expiresAt": "2026-01-08T18:00:00Z",
      "current": false,
      "revoked": false
    }
  ]
}
```

#### 5. Revoke Specific Session

**Endpoint:** `POST /auth/api/v1/auth/sessions/revoke`

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Request:**
```json
{
  "sessionId": 102
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session revoked successfully",
  "data": "success"
}
```

## Configuration

### Application Properties

All profiles now include:

```properties
# Access Token (short-lived) - 15 minutes
jwt.access.expiration=900000

# Refresh Token (long-lived) - 7 days
jwt.refresh.expiration=604800000

# Maximum concurrent sessions per user
session.max-per-user=5
```

### Environment Variables (Production)

```bash
# JWT Configuration
export JWT_SECRET="your-strong-secret-key-256-bits-minimum"
export JWT_ACCESS_EXPIRATION=900000    # 15 minutes
export JWT_REFRESH_EXPIRATION=604800000 # 7 days

# Session Management
export SESSION_MAX_PER_USER=5
```

## Frontend Integration

### Login Flow

```javascript
// Login
const response = await fetch('/auth/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john.doe',
    password: 'password123',
    entityCode: 'APP001'
  })
});

const { data } = await response.json();

// Store both tokens
localStorage.setItem('accessToken', data.token);
localStorage.setItem('refreshToken', data.refreshToken);
```

### Auto-Refresh on 401

```javascript
async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('accessToken');

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // If 401, try refreshing token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');

    const refreshResponse = await fetch('/auth/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (refreshResponse.ok) {
      const { data } = await refreshResponse.json();

      // Update stored tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${data.accessToken}`
        }
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```

### Logout

```javascript
async function logout() {
  const refreshToken = localStorage.getItem('refreshToken');

  await fetch('/auth/api/v1/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}
```

### Session Management UI

```javascript
// Get active sessions
async function getSessions() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch(
    `/auth/api/v1/auth/sessions?refreshToken=${refreshToken}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  const { data } = await response.json();
  return data; // Array of SessionDTO
}

// Revoke specific session
async function revokeSession(sessionId) {
  const accessToken = localStorage.getItem('accessToken');

  await fetch('/auth/api/v1/auth/sessions/revoke', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sessionId })
  });
}

// Logout from all devices
async function logoutAll() {
  const accessToken = localStorage.getItem('accessToken');

  await fetch('/auth/api/v1/auth/logout-all', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}
```

## Scheduled Cleanup

Two scheduled jobs automatically clean up old tokens:

### 1. Expired Tokens Cleanup
- **Schedule:** Daily at 2:00 AM
- **Action:** Deletes tokens past their expiration date

### 2. Old Revoked Tokens Cleanup
- **Schedule:** Every Sunday at 3:00 AM
- **Action:** Deletes revoked tokens older than 30 days

## Security Features

### 1. Token Hashing
- Refresh tokens are hashed (SHA-256) before storage
- If database is compromised, tokens cannot be used

### 2. Token Rotation
- Each refresh generates new tokens
- Old refresh token is immediately revoked
- Prevents token reuse attacks

### 3. Session Limits
- Maximum 5 concurrent sessions per user (configurable)
- Oldest session auto-revoked when limit exceeded

### 4. Session Metadata
- IP address tracking
- User agent parsing
- Device identification
- Suspicious activity detection ready

### 5. Revocation Support
- Single session logout
- All devices logout
- Admin can force logout users

## Monitoring & Administration

### Query Active Sessions

```sql
-- All active sessions
SELECT
  rt.username,
  rt.entity,
  rt.device_name,
  rt.ip_address,
  rt.create_date,
  rt.last_used_at
FROM D_REFRESH_TOKENS rt
WHERE rt.revoked = 0
  AND rt.expires_at > SYSDATE
ORDER BY rt.last_used_at DESC;

-- Sessions per user
SELECT
  username,
  entity,
  COUNT(*) as session_count
FROM D_REFRESH_TOKENS
WHERE revoked = 0
  AND expires_at > SYSDATE
GROUP BY username, entity
ORDER BY session_count DESC;

-- Recently created sessions
SELECT
  rt.username,
  rt.device_name,
  rt.ip_address,
  rt.create_date
FROM D_REFRESH_TOKENS rt
WHERE rt.create_date > SYSDATE - 1
  AND rt.revoked = 0
ORDER BY rt.create_date DESC;
```

### Force Logout User (Admin)

```sql
-- Revoke all tokens for a user
UPDATE D_REFRESH_TOKENS
SET revoked = 1,
    revoked_at = SYSDATE
WHERE username = 'john.doe'
  AND revoked = 0;

COMMIT;
```

## Testing

### Manual Testing

1. **Login:**
   ```bash
   curl -X POST http://localhost:8091/auth/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password","entityCode":"APP001"}'
   ```

2. **Refresh Token:**
   ```bash
   curl -X POST http://localhost:8091/auth/api/v1/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"550e8400-e29b-41d4-a716-446655440000"}'
   ```

3. **Get Sessions:**
   ```bash
   curl -X GET "http://localhost:8091/auth/api/v1/auth/sessions" \
     -H "Authorization: Bearer eyJhbGc..."
   ```

4. **Logout:**
   ```bash
   curl -X POST http://localhost:8091/auth/api/v1/auth/logout \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"550e8400-e29b-41d4-a716-446655440000"}'
   ```

## Migration Notes

### Backward Compatibility

The implementation maintains backward compatibility:
- Old `jwt.expiration` property still works
- Login response includes both `token` and `refreshToken`
- Existing clients can ignore `refreshToken` initially

### Migration Steps

1. **Database:**
   - Run DDL script to create `D_REFRESH_TOKENS` table

2. **Application:**
   - Code changes already deployed
   - Update `application.properties` if needed

3. **Frontend:**
   - Update to store both tokens
   - Implement auto-refresh logic
   - Add session management UI (optional)

4. **Monitor:**
   - Check logs for refresh token usage
   - Monitor session counts in database

## Troubleshooting

### Common Issues

**Issue:** "Invalid refresh token" error

**Solutions:**
- Token may have expired (check `expires_at`)
- Token may have been revoked (check `revoked` field)
- Token may have been used already (token rotation)

**Issue:** Too many sessions

**Solution:**
- User has exceeded `session.max-per-user` limit
- Oldest session is auto-revoked
- User can manually revoke sessions

**Issue:** Cleanup job not running

**Solution:**
- Verify `@EnableScheduling` annotation exists
- Check application logs for scheduled task execution
- Verify cron expressions are correct

## Best Practices

1. **Token Storage:**
   - Store `accessToken` in memory or sessionStorage
   - Store `refreshToken` in httpOnly cookie (recommended) or localStorage
   - Never expose tokens in URLs

2. **Token Expiration:**
   - Keep access tokens short (15-30 minutes)
   - Refresh tokens can be longer (7-30 days)
   - Adjust based on security requirements

3. **Session Limits:**
   - Set reasonable limits (3-10 sessions)
   - Too low = user frustration
   - Too high = security risk

4. **Monitoring:**
   - Track failed refresh attempts
   - Monitor session counts
   - Alert on unusual patterns

## Future Enhancements

Possible improvements:

1. **IP Geolocation:** Convert IP to city/country
2. **Device Fingerprinting:** More accurate device tracking
3. **Anomaly Detection:** Flag suspicious logins
4. **Push Notifications:** Alert on new device login
5. **Remember Me:** Extended refresh token for trusted devices
6. **Admin UI:** Web interface for session management

---

**Documentation Version:** 1.0
**Last Updated:** 2026-01-02
**Author:** Auth Service Team
