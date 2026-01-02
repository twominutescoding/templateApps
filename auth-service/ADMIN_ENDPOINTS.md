# Admin Endpoints - Session Management

This document describes the admin endpoints for session management in the auth-service.

## Overview

Three admin endpoints have been added to allow administrators to:
1. View all active sessions across all users
2. Revoke any user's session
3. Force logout a specific user (all their sessions)

**Security Note:** These endpoints currently require authentication (any valid JWT token). In production, you should add role-based access control to restrict these endpoints to ADMIN users only.

---

## 1. Get All Active Sessions

Returns a list of all active sessions for all users in the system.

### Endpoint
```
GET /auth/api/v1/auth/admin/sessions
```

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "All active sessions retrieved",
  "data": [
    {
      "sessionId": 101,
      "username": "john.doe",
      "entity": "APP001",
      "deviceName": "Chrome on Windows",
      "ipAddress": "192.168.1.50",
      "location": null,
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "createdAt": "2026-01-02T08:00:00",
      "lastUsedAt": "2026-01-02T14:30:00",
      "expiresAt": "2026-01-09T08:00:00",
      "current": false,
      "revoked": false
    },
    {
      "sessionId": 102,
      "username": "jane.smith",
      "entity": "APP001",
      "deviceName": "Safari on iPhone",
      "ipAddress": "10.0.0.23",
      "location": null,
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0...)...",
      "createdAt": "2026-01-01T18:00:00",
      "lastUsedAt": "2026-01-02T10:00:00",
      "expiresAt": "2026-01-08T18:00:00",
      "current": false,
      "revoked": false
    },
    {
      "sessionId": 103,
      "username": "admin",
      "entity": "APP002",
      "deviceName": "Firefox on Linux",
      "ipAddress": "172.16.0.10",
      "location": null,
      "userAgent": "Mozilla/5.0 (X11; Linux x86_64)...",
      "createdAt": "2026-01-02T07:00:00",
      "lastUsedAt": "2026-01-02T14:00:00",
      "expiresAt": "2026-01-09T07:00:00",
      "current": false,
      "revoked": false
    }
  ]
}
```

### Example Usage

#### cURL
```bash
curl -X GET "http://localhost:8091/auth/api/v1/auth/admin/sessions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

#### JavaScript
```javascript
async function getAllSessions() {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(
    'http://localhost:8091/auth/api/v1/auth/admin/sessions',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log('All sessions:', result.data);
    return result.data;
  }

  return null;
}

// Display in admin panel
async function displayAllSessions() {
  const sessions = await getAllSessions();

  // Group by username
  const sessionsByUser = sessions.reduce((acc, session) => {
    if (!acc[session.username]) {
      acc[session.username] = [];
    }
    acc[session.username].push(session);
    return acc;
  }, {});

  console.log('Sessions by user:', sessionsByUser);

  // Example: Display in table
  const table = document.getElementById('sessions-table');
  table.innerHTML = `
    <tr>
      <th>Session ID</th>
      <th>Username</th>
      <th>Entity</th>
      <th>Device</th>
      <th>IP Address</th>
      <th>Last Active</th>
      <th>Actions</th>
    </tr>
  `;

  sessions.forEach(session => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${session.sessionId}</td>
      <td>${session.username}</td>
      <td>${session.entity}</td>
      <td>${session.deviceName}</td>
      <td>${session.ipAddress}</td>
      <td>${new Date(session.lastUsedAt).toLocaleString()}</td>
      <td>
        <button onclick="revokeSessionAdmin(${session.sessionId})">
          Revoke
        </button>
      </td>
    `;
  });
}
```

#### Java (Spring RestTemplate)
```java
@Service
public class SessionAdminService {

    private final RestTemplate restTemplate;

    @Value("${auth.service.url}")
    private String authServiceUrl;

    public List<SessionDTO> getAllActiveSessions(String adminAccessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + adminAccessToken);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<ApiResponse<List<SessionDTO>>> response =
            restTemplate.exchange(
                authServiceUrl + "/api/v1/auth/admin/sessions",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<ApiResponse<List<SessionDTO>>>() {}
            );

        if (response.getBody() != null && response.getBody().isSuccess()) {
            return response.getBody().getData();
        }

        return Collections.emptyList();
    }
}
```

---

## 2. Revoke Any User's Session

Allows admin to revoke a specific session by session ID (from any user).

### Endpoint
```
POST /auth/api/v1/auth/admin/sessions/revoke
```

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "sessionId": 102
}
```

### Response
```json
{
  "success": true,
  "message": "Session revoked successfully by admin",
  "data": "success"
}
```

### Example Usage

#### cURL
```bash
curl -X POST "http://localhost:8091/auth/api/v1/auth/admin/sessions/revoke" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": 102
  }'
```

#### JavaScript
```javascript
async function revokeSessionAdmin(sessionId) {
  const accessToken = localStorage.getItem('accessToken');

  const response = await fetch(
    'http://localhost:8091/auth/api/v1/auth/admin/sessions/revoke',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: sessionId
      })
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log(`Session ${sessionId} revoked successfully`);
    // Refresh the sessions list
    displayAllSessions();
    return true;
  } else {
    console.error('Failed to revoke session:', result.message);
    return false;
  }
}
```

#### Java
```java
public boolean revokeSession(String adminAccessToken, Long sessionId) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "Bearer " + adminAccessToken);
    headers.setContentType(MediaType.APPLICATION_JSON);

    RevokeSessionRequest request = new RevokeSessionRequest(sessionId);
    HttpEntity<RevokeSessionRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<ApiResponse<String>> response = restTemplate.postForEntity(
        authServiceUrl + "/api/v1/auth/admin/sessions/revoke",
        entity,
        new ParameterizedTypeReference<ApiResponse<String>>() {}
    );

    return response.getBody() != null && response.getBody().isSuccess();
}
```

---

## 3. Force Logout User (All Sessions)

Revokes all active sessions for a specific user.

### Endpoint
```
POST /auth/api/v1/auth/admin/users/{username}/logout
```

### Headers
```
Authorization: Bearer <access_token>
```

### Path Parameters
- `username` - The username to logout

### Response
```json
{
  "success": true,
  "message": "All sessions for user john.doe have been revoked",
  "data": "success"
}
```

### Example Usage

#### cURL
```bash
curl -X POST "http://localhost:8091/auth/api/v1/auth/admin/users/john.doe/logout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

#### JavaScript
```javascript
async function forceLogoutUser(username) {
  const accessToken = localStorage.getItem('accessToken');

  const confirmed = confirm(
    `Are you sure you want to logout all sessions for user "${username}"?`
  );

  if (!confirmed) {
    return false;
  }

  const response = await fetch(
    `http://localhost:8091/auth/api/v1/auth/admin/users/${username}/logout`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  const result = await response.json();

  if (result.success) {
    console.log(`All sessions for ${username} have been revoked`);
    alert(result.message);
    // Refresh the sessions list
    displayAllSessions();
    return true;
  } else {
    console.error('Failed to logout user:', result.message);
    alert('Failed: ' + result.message);
    return false;
  }
}

// Add to user management UI
function renderUserRow(username, sessionCount) {
  return `
    <tr>
      <td>${username}</td>
      <td>${sessionCount}</td>
      <td>
        <button onclick="forceLogoutUser('${username}')">
          Force Logout
        </button>
      </td>
    </tr>
  `;
}
```

#### Java
```java
public boolean forceLogoutUser(String adminAccessToken, String targetUsername) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "Bearer " + adminAccessToken);

    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<ApiResponse<String>> response = restTemplate.postForEntity(
        authServiceUrl + "/api/v1/auth/admin/users/" + targetUsername + "/logout",
        entity,
        new ParameterizedTypeReference<ApiResponse<String>>() {}
    );

    return response.getBody() != null && response.getBody().isSuccess();
}
```

---

## Complete Admin Panel Example

Here's a complete React component for an admin session management panel:

```javascript
// AdminSessionPanel.js
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

function AdminSessionPanel() {
  const { fetchWithAuth } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadSessions();
    // Refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        'http://localhost:8091/auth/api/v1/auth/admin/sessions'
      );

      if (response && response.ok) {
        const result = await response.json();
        if (result.success) {
          setSessions(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
    setLoading(false);
  };

  const revokeSession = async (sessionId) => {
    if (!confirm('Revoke this session?')) return;

    try {
      const response = await fetchWithAuth(
        'http://localhost:8091/auth/api/v1/auth/admin/sessions/revoke',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId })
        }
      );

      if (response && response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Session revoked successfully');
          loadSessions();
        }
      }
    } catch (error) {
      console.error('Failed to revoke session:', error);
      alert('Failed to revoke session');
    }
  };

  const forceLogoutUser = async (username) => {
    if (!confirm(`Force logout all sessions for user "${username}"?`)) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:8091/auth/api/v1/auth/admin/users/${username}/logout`,
        { method: 'POST' }
      );

      if (response && response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(result.message);
          loadSessions();
        }
      }
    } catch (error) {
      console.error('Failed to logout user:', error);
      alert('Failed to logout user');
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter(
    session =>
      session.username.toLowerCase().includes(filter.toLowerCase()) ||
      session.ipAddress.includes(filter) ||
      session.deviceName.toLowerCase().includes(filter.toLowerCase())
  );

  // Group by username
  const sessionsByUser = filteredSessions.reduce((acc, session) => {
    if (!acc[session.username]) {
      acc[session.username] = [];
    }
    acc[session.username].push(session);
    return acc;
  }, {});

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div className="admin-session-panel">
      <h2>Active Sessions ({sessions.length})</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Filter by username, IP, or device..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <button onClick={loadSessions}>Refresh</button>
      </div>

      <div className="session-groups">
        {Object.entries(sessionsByUser).map(([username, userSessions]) => (
          <div key={username} className="user-group">
            <h3>
              {username} ({userSessions.length} session
              {userSessions.length !== 1 ? 's' : ''})
              <button onClick={() => forceLogoutUser(username)}>
                Force Logout All
              </button>
            </h3>

            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Entity</th>
                  <th>Device</th>
                  <th>IP Address</th>
                  <th>Created</th>
                  <th>Last Active</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userSessions.map(session => (
                  <tr key={session.sessionId}>
                    <td>{session.sessionId}</td>
                    <td>{session.entity}</td>
                    <td>{session.deviceName}</td>
                    <td>{session.ipAddress}</td>
                    <td>{new Date(session.createdAt).toLocaleString()}</td>
                    <td>
                      {session.lastUsedAt
                        ? new Date(session.lastUsedAt).toLocaleString()
                        : 'Never'}
                    </td>
                    <td>{new Date(session.expiresAt).toLocaleString()}</td>
                    <td>
                      <button onClick={() => revokeSession(session.sessionId)}>
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <p>No active sessions{filter && ' matching filter'}.</p>
      )}
    </div>
  );
}

export default AdminSessionPanel;
```

---

## SQL Queries for Session Monitoring

If you need to query sessions directly from the database:

```sql
-- All active sessions
SELECT
  rt.id,
  rt.username,
  rt.entity,
  rt.device_name,
  rt.ip_address,
  rt.create_date,
  rt.last_used_at,
  rt.expires_at
FROM D_REFRESH_TOKENS rt
WHERE rt.revoked = 0
  AND rt.expires_at > SYSDATE
ORDER BY rt.last_used_at DESC NULLS LAST;

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

-- Users with most sessions
SELECT
  username,
  COUNT(*) as total_sessions
FROM D_REFRESH_TOKENS
WHERE revoked = 0
  AND expires_at > SYSDATE
GROUP BY username
HAVING COUNT(*) > 1
ORDER BY total_sessions DESC;

-- Recent login activity (last 24 hours)
SELECT
  rt.username,
  rt.device_name,
  rt.ip_address,
  rt.create_date
FROM D_REFRESH_TOKENS rt
WHERE rt.create_date > SYSDATE - 1
  AND rt.revoked = 0
ORDER BY rt.create_date DESC;

-- Sessions from specific IP
SELECT
  rt.username,
  rt.device_name,
  rt.create_date,
  rt.last_used_at
FROM D_REFRESH_TOKENS rt
WHERE rt.ip_address = '192.168.1.50'
  AND rt.revoked = 0
  AND rt.expires_at > SYSDATE;
```

---

## Security Recommendations

### 1. Add Role-Based Access Control

Currently these endpoints only check for valid authentication. In production, add admin role checking:

```java
// Example implementation
private boolean isAdmin(String username) {
    User user = databaseUserDetailsService.getUserByUsername(username);
    if (user == null) return false;

    return user.getUserRoles().stream()
        .anyMatch(ur -> "ADMIN".equals(ur.getId().getRole()) &&
                       "ACTIVE".equals(ur.getStatus()));
}

// Use in endpoints
if (!isAdmin(username)) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.error("Insufficient permissions"));
}
```

### 2. Add Audit Logging

Log all admin actions for security audit:

```java
@PostMapping("/admin/sessions/revoke")
public ResponseEntity<ApiResponse<String>> revokeSessionByAdmin(...) {
    // ... existing code ...

    // Add audit log
    auditLogService.log(
        adminUsername,
        "REVOKE_SESSION",
        "Revoked session " + sessionId,
        request.getRemoteAddr()
    );

    // ... rest of code ...
}
```

### 3. Rate Limiting

Add rate limiting to prevent abuse:

```java
@RateLimit(maxRequests = 100, windowMinutes = 1)
@GetMapping("/admin/sessions")
public ResponseEntity<ApiResponse<List<SessionDTO>>> getAllSessions(...) {
    // ... existing code ...
}
```

---

## Testing

### Test with cURL

```bash
# 1. Login as admin
TOKEN=$(curl -X POST http://localhost:8091/auth/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password","entityCode":"APP001"}' \
  | jq -r '.data.token')

# 2. Get all sessions
curl -X GET "http://localhost:8091/auth/api/v1/auth/admin/sessions" \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Revoke a session
curl -X POST "http://localhost:8091/auth/api/v1/auth/admin/sessions/revoke" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 102}' | jq

# 4. Force logout user
curl -X POST "http://localhost:8091/auth/api/v1/auth/admin/users/john.doe/logout" \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Summary

**New Admin Endpoints:**

1. `GET /admin/sessions` - View all active sessions
2. `POST /admin/sessions/revoke` - Revoke any session
3. `POST /admin/users/{username}/logout` - Force logout user

**Security:**
- Currently requires any valid JWT token
- TODO: Add ADMIN role checking
- Recommended: Add audit logging

**Use Cases:**
- Monitor active user sessions
- Investigate suspicious activity
- Force logout compromised accounts
- Manage concurrent session limits
- Security incident response

---

**Version:** 1.0
**Last Updated:** 2026-01-02
