# Exception Handling Documentation

## Overview

The auth-service uses a **centralized exception handling system** that provides:
- ✅ **Standardized error responses** - Consistent format across all endpoints
- ✅ **Meaningful error codes** - Numeric codes for client-side error handling
- ✅ **Field-level validation** - Detailed validation errors for form submissions
- ✅ **Security best practices** - Generic messages for authentication failures
- ✅ **Comprehensive logging** - Different log levels for different error types
- ✅ **Easy maintenance** - Add new exceptions without changing controllers

---

## Architecture

### Components

```
ErrorCode (enum)
  ↓
ApiErrorResponse (response wrapper)
  ↓
Custom Exceptions (BaseException + subclasses)
  ↓
GlobalExceptionHandler (@RestControllerAdvice)
  ↓
HTTP Response
```

### Error Response Format

All errors return a standardized JSON structure:

```json
{
  "code": "101",
  "type": "INVALID_CREDENTIALS",
  "message": "Invalid username or password.",
  "timestamp": "2026-01-02T14:30:00.123",
  "fieldErrors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

**Fields:**
- `code` - Numeric error code (e.g., "101")
- `type` - Error type from ErrorCode enum (e.g., "INVALID_CREDENTIALS")
- `message` - Human-readable error message
- `timestamp` - When the error occurred (ISO-8601 format)
- `fieldErrors` - Optional array of field-level validation errors

---

## Error Codes

Error codes are organized by category:

### General Errors (000-099)
| Code | Type | Message | HTTP Status |
|------|------|---------|-------------|
| 000 | INTERNAL_SERVER_ERROR | An unexpected error occurred. | 500 |
| 003 | VALIDATION_ERROR | Validation failed for one or more fields. | 400 |
| 005 | INVALID_ARGUMENT | The provided argument is invalid. | 400 |
| 006 | METHOD_NOT_ALLOWED | The HTTP method is not supported for this endpoint. | 405 |
| 007 | UNSUPPORTED_MEDIA_TYPE | The provided content type is not supported. | 415 |
| 008 | MALFORMED_REQUEST | The request body is missing or malformed. | 400 |
| 009 | MISSING_PARAMETER | A required request parameter is missing. | 400 |

### Authentication Errors (100-199)
| Code | Type | Message | HTTP Status |
|------|------|---------|-------------|
| 100 | AUTHENTICATION_ERROR | Authentication failed. Please check your credentials. | 401 |
| 101 | INVALID_CREDENTIALS | Invalid username or password. | 401 |
| 102 | INVALID_TOKEN | The provided token is invalid or expired. | 401 |
| 103 | TOKEN_EXPIRED | The authentication token has expired. | 401 |
| 104 | ACCOUNT_DISABLED | This account has been disabled. | 401 |
| 105 | ACCOUNT_LOCKED | This account has been locked. | 401 |
| 106 | INVALID_REFRESH_TOKEN | The refresh token is invalid or expired. | 401 |

### Authorization Errors (200-299)
| Code | Type | Message | HTTP Status |
|------|------|---------|-------------|
| 200 | ACCESS_DENIED | You do not have permission to perform this action. | 403 |
| 201 | INSUFFICIENT_PERMISSIONS | Insufficient permissions to access this resource. | 403 |
| 202 | UNAUTHORIZED_SESSION_ACCESS | You can only manage your own sessions. | 403 |

### Resource Errors (300-399)
| Code | Type | Message | HTTP Status |
|------|------|---------|-------------|
| 300 | ENTITY_NOT_FOUND | The requested entity was not found. | 404 |
| 301 | USER_NOT_FOUND | User not found. | 404 |
| 302 | ROLE_NOT_FOUND | Role not found. | 404 |
| 303 | SESSION_NOT_FOUND | Session not found. | 404 |
| 304 | USER_ALREADY_EXISTS | A user with this username already exists. | 409 |

### Database Errors (400-499)
| Code | Type | Message | HTTP Status |
|------|------|---------|-------------|
| 400 | DATA_INTEGRITY_ERROR | A database constraint was violated. | 409 |
| 401 | INTERNAL_DATABASE_ERROR | Internal database error. | 500 |
| 402 | LAZY_INITIALIZATION_ERROR | Failed to load related data from database. | 500 |

### LDAP Errors (500-599)
| Code | Type | Message | HTTP Status |
|------|------|---------|-------------|
| 500 | LDAP_CONNECTION_ERROR | Failed to connect to LDAP server. | 500 |
| 501 | LDAP_AUTHENTICATION_ERROR | LDAP authentication failed. | 401 |

### Session Errors (600-699)
| Code | Type | Message | HTTP Status |
|------|------|---------|-------------|
| 600 | SESSION_LIMIT_EXCEEDED | Maximum number of concurrent sessions exceeded. | 409 |
| 601 | SESSION_EXPIRED | Session has expired. | 401 |
| 602 | SESSION_REVOKED | Session has been revoked. | 401 |

---

## Custom Exceptions

### Exception Hierarchy

```
RuntimeException
  └── BaseException
       ├── CustomValidationException
       ├── CustomAuthenticationException
       ├── CustomAuthorizationException
       ├── ResourceNotFoundException
       ├── InternalDatabaseException
       └── InternalApiException
```

### Usage Examples

#### 1. CustomValidationException

**Simple validation error:**
```java
if (username == null || username.isEmpty()) {
    throw new CustomValidationException("Username is required");
}
```

**Field-level validation errors:**
```java
List<ApiErrorResponse.FieldError> errors = new ArrayList<>();
errors.add(new ApiErrorResponse.FieldError("username", "Username is required"));
errors.add(new ApiErrorResponse.FieldError("password", "Password must be at least 8 characters"));

throw new CustomValidationException("Validation failed", errors);
```

**Response:**
```json
{
  "code": "003",
  "type": "VALIDATION_ERROR",
  "message": "Validation failed",
  "timestamp": "2026-01-02T14:30:00",
  "fieldErrors": [
    {"field": "username", "message": "Username is required"},
    {"field": "password", "message": "Password must be at least 8 characters"}
  ]
}
```

#### 2. CustomAuthenticationException

**Invalid credentials:**
```java
if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
    throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);
}
```

**Expired token:**
```java
if (jwtUtil.isTokenExpired(token)) {
    throw new CustomAuthenticationException(
        ErrorCode.TOKEN_EXPIRED,
        "Your session has expired. Please login again."
    );
}
```

**Account disabled:**
```java
if (!"ACTIVE".equals(user.getStatus())) {
    throw new CustomAuthenticationException(ErrorCode.ACCOUNT_DISABLED);
}
```

**Response:**
```json
{
  "code": "103",
  "type": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please login again.",
  "timestamp": "2026-01-02T14:30:00"
}
```

#### 3. CustomAuthorizationException

**Access denied:**
```java
if (!currentUser.equals(requestedUser)) {
    throw new CustomAuthorizationException(
        ErrorCode.UNAUTHORIZED_SESSION_ACCESS,
        "You can only manage your own sessions"
    );
}
```

**Insufficient permissions:**
```java
if (!userHasRole("ADMIN")) {
    throw new CustomAuthorizationException(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        "ADMIN role required to access this resource"
    );
}
```

**Response:**
```json
{
  "code": "202",
  "type": "UNAUTHORIZED_SESSION_ACCESS",
  "message": "You can only manage your own sessions",
  "timestamp": "2026-01-02T14:30:00"
}
```

#### 4. ResourceNotFoundException

**User not found:**
```java
User user = userRepository.findByUsername(username)
    .orElseThrow(() -> new ResourceNotFoundException(
        ErrorCode.USER_NOT_FOUND,
        "User '" + username + "' not found"
    ));
```

**Session not found:**
```java
RefreshToken session = refreshTokenRepository.findById(sessionId)
    .orElseThrow(() -> new ResourceNotFoundException(
        ErrorCode.SESSION_NOT_FOUND,
        "Session with ID " + sessionId + " not found"
    ));
```

**Response:**
```json
{
  "code": "301",
  "type": "USER_NOT_FOUND",
  "message": "User 'admin' not found",
  "timestamp": "2026-01-02T14:30:00"
}
```

#### 5. InternalDatabaseException

**Data integrity violation:**
```java
try {
    userRepository.save(user);
} catch (DataIntegrityViolationException e) {
    throw new InternalDatabaseException(
        ErrorCode.DATA_INTEGRITY_ERROR,
        "Username '" + user.getUsername() + "' already exists",
        e
    );
}
```

**Lazy initialization error:**
```java
try {
    user.getUserRoles().size(); // Access lazy collection outside transaction
} catch (LazyInitializationException e) {
    throw new InternalDatabaseException(
        ErrorCode.LAZY_INITIALIZATION_ERROR,
        "Failed to load user roles",
        e
    );
}
```

**Response:**
```json
{
  "code": "400",
  "type": "DATA_INTEGRITY_ERROR",
  "message": "Username 'admin' already exists",
  "timestamp": "2026-01-02T14:30:00"
}
```

#### 6. InternalApiException

**JWT generation failure:**
```java
try {
    String token = jwtUtil.generateToken(username);
} catch (Exception e) {
    throw new InternalApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to generate authentication token",
        e
    );
}
```

**LDAP connection error:**
```java
try {
    ldapTemplate.authenticate(username, password);
} catch (CommunicationException e) {
    throw new InternalApiException(
        ErrorCode.LDAP_CONNECTION_ERROR,
        "Unable to connect to LDAP server",
        e
    );
}
```

**Response:**
```json
{
  "code": "500",
  "type": "LDAP_CONNECTION_ERROR",
  "message": "Unable to connect to LDAP server",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

## Spring Security Exception Handling

The GlobalExceptionHandler automatically handles Spring Security exceptions:

### Authentication Exceptions

**BadCredentialsException** → 401 Unauthorized
```java
// Thrown automatically by Spring Security during login
// No need to catch - GlobalExceptionHandler handles it
```

**DisabledException** → 401 Unauthorized
```java
// Thrown when UserDetails.isEnabled() returns false
```

**LockedException** → 401 Unauthorized
```java
// Thrown when UserDetails.isAccountNonLocked() returns false
```

**UsernameNotFoundException** → 401 Unauthorized
```java
// Thrown by UserDetailsService.loadUserByUsername()
```

### Authorization Exceptions

**AccessDeniedException** → 403 Forbidden
```java
// Thrown when @PreAuthorize check fails
@GetMapping("/admin/sessions")
@PreAuthorize("hasRole('ADMIN')")  // Throws AccessDeniedException if not ADMIN
public ResponseEntity<?> getAllSessions() {
    // ...
}
```

---

## Validation Exception Handling

### Jakarta Validation (@Valid)

The GlobalExceptionHandler automatically handles `@Valid` annotation failures:

```java
@PostMapping("/register")
public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegisterRequest request) {
    // If validation fails, GlobalExceptionHandler converts it to ApiErrorResponse
    // ...
}
```

**DTO with validation annotations:**
```java
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @Email(message = "Invalid email format")
    private String email;
}
```

**Error response:**
```json
{
  "code": "003",
  "type": "VALIDATION_ERROR",
  "message": "Validation failed for one or more fields.",
  "timestamp": "2026-01-02T14:30:00",
  "fieldErrors": [
    {"field": "username", "message": "Username is required"},
    {"field": "password", "message": "Password must be at least 8 characters"},
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

---

## HTTP Protocol Exception Handling

### Method Not Allowed (405)

Automatically handled when using wrong HTTP method:

```bash
# POST endpoint called with GET
curl -X GET http://localhost:8091/auth/api/v1/auth/login
```

**Response:**
```json
{
  "code": "006",
  "type": "METHOD_NOT_ALLOWED",
  "message": "HTTP method 'GET' is not supported for this endpoint. Supported methods: [POST]",
  "timestamp": "2026-01-02T14:30:00"
}
```

### Unsupported Media Type (415)

Automatically handled when sending wrong content type:

```bash
# JSON endpoint called with XML
curl -X POST http://localhost:8091/auth/api/v1/auth/login \
  -H "Content-Type: application/xml" \
  -d "<login>...</login>"
```

**Response:**
```json
{
  "code": "007",
  "type": "UNSUPPORTED_MEDIA_TYPE",
  "message": "Content type 'application/xml' is not supported. Supported types: [application/json]",
  "timestamp": "2026-01-02T14:30:00"
}
```

### Malformed JSON (400)

Automatically handled when JSON is invalid:

```bash
curl -X POST http://localhost:8091/auth/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": }'  # Invalid JSON
```

**Response:**
```json
{
  "code": "008",
  "type": "MALFORMED_REQUEST",
  "message": "Request body is missing or malformed. Please check JSON syntax.",
  "timestamp": "2026-01-02T14:30:00"
}
```

### Missing Parameter (400)

Automatically handled when required parameter is missing:

```bash
curl -X GET "http://localhost:8091/auth/api/v1/auth/sessions"
# Missing required 'refreshToken' parameter
```

**Response:**
```json
{
  "code": "009",
  "type": "MISSING_PARAMETER",
  "message": "Required parameter 'refreshToken' is missing.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

## Database Exception Handling

### Data Integrity Violations

Automatically handled for constraint violations:

```java
// Unique constraint violation
try {
    userRepository.save(user);
} catch (DataIntegrityViolationException e) {
    // GlobalExceptionHandler converts to ApiErrorResponse
}
```

**Response:**
```json
{
  "code": "400",
  "type": "DATA_INTEGRITY_ERROR",
  "message": "A database constraint was violated. The provided value already exists.",
  "timestamp": "2026-01-02T14:30:00"
}
```

### Lazy Initialization Errors

Automatically handled when accessing lazy collections:

```java
// Accessing user.getUserRoles() outside transaction
try {
    user.getUserRoles().size();
} catch (LazyInitializationException e) {
    // GlobalExceptionHandler converts to ApiErrorResponse
}
```

**Response:**
```json
{
  "code": "402",
  "type": "LAZY_INITIALIZATION_ERROR",
  "message": "Failed to load related data from database.",
  "timestamp": "2026-01-02T14:30:00"
}
```

**Solution:** Add `@Transactional` to the method.

---

## Logging Strategy

The GlobalExceptionHandler uses different log levels based on error severity:

### WARN Level
- Validation errors (expected user errors)
- Authentication failures (security events but expected)
- Authorization failures (access denied)
- HTTP protocol errors (method not allowed, unsupported media type)
- Missing parameters

**Example log:**
```
WARN  c.t.b.a.e.GlobalExceptionHandler - Validation error on /auth/api/v1/auth/register: Validation failed for one or more fields.
```

### ERROR Level
- Database errors (data integrity, lazy initialization)
- Internal API errors (unexpected failures)
- Generic exceptions (fallback handler)

**Example log:**
```
ERROR c.t.b.a.e.GlobalExceptionHandler - Database error on /auth/api/v1/auth/register: Username already exists
org.springframework.dao.DataIntegrityViolationException: ...
    at com.template.business.auth.repository.UserRepository.save(...)
    ...
```

---

## Best Practices

### 1. Use Specific Error Codes

**Good:**
```java
throw new CustomAuthenticationException(ErrorCode.TOKEN_EXPIRED);
```

**Bad:**
```java
throw new RuntimeException("Token expired");
```

### 2. Provide Context in Error Messages

**Good:**
```java
throw new ResourceNotFoundException(
    ErrorCode.USER_NOT_FOUND,
    "User '" + username + "' not found"
);
```

**Bad:**
```java
throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND);
```

### 3. Don't Expose Sensitive Information

**Good:**
```java
// Generic message for authentication failures
throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);
```

**Bad:**
```java
// Reveals that username exists
throw new CustomAuthenticationException(
    ErrorCode.INVALID_CREDENTIALS,
    "Invalid password for user '" + username + "'"
);
```

### 4. Include Original Exception for Server Errors

**Good:**
```java
try {
    // Database operation
} catch (DataIntegrityViolationException e) {
    throw new InternalDatabaseException(
        ErrorCode.DATA_INTEGRITY_ERROR,
        "Failed to save user",
        e  // Include original exception for stack trace
    );
}
```

**Bad:**
```java
try {
    // Database operation
} catch (DataIntegrityViolationException e) {
    throw new InternalDatabaseException(
        ErrorCode.DATA_INTEGRITY_ERROR,
        "Failed to save user"
        // Lost original exception!
    );
}
```

### 5. Use Field-Level Errors for Validation

**Good:**
```java
List<ApiErrorResponse.FieldError> errors = new ArrayList<>();
errors.add(new ApiErrorResponse.FieldError("username", "Username is required"));
errors.add(new ApiErrorResponse.FieldError("password", "Password too short"));

throw new CustomValidationException("Validation failed", errors);
```

**Bad:**
```java
throw new CustomValidationException("Username is required and password is too short");
```

### 6. Let Spring Handle Standard Exceptions

**Good:**
```java
// Let @Valid annotation handle validation
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    // GlobalExceptionHandler handles MethodArgumentNotValidException
}
```

**Bad:**
```java
// Manual validation (unnecessary)
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    if (request.getUsername() == null) {
        throw new CustomValidationException("Username is required");
    }
    // ...
}
```

---

## Testing

### Test Invalid Credentials

```bash
curl -X POST http://localhost:8091/auth/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong","entityCode":"APP001"}'
```

**Response: 401 Unauthorized**
```json
{
  "code": "101",
  "type": "INVALID_CREDENTIALS",
  "message": "Invalid username or password.",
  "timestamp": "2026-01-02T14:30:00"
}
```

### Test Validation Error

```bash
curl -X POST http://localhost:8091/auth/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"","password":"123"}'
```

**Response: 400 Bad Request**
```json
{
  "code": "003",
  "type": "VALIDATION_ERROR",
  "message": "Validation failed for one or more fields.",
  "timestamp": "2026-01-02T14:30:00",
  "fieldErrors": [
    {"field": "username", "message": "Username is required"},
    {"field": "password", "message": "Password must be at least 8 characters"}
  ]
}
```

### Test Access Denied

```bash
# Login as regular user
TOKEN=$(curl -s -X POST http://localhost:8091/auth/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password","entityCode":"APP001"}' \
  | jq -r '.data.token')

# Try to access admin endpoint
curl -X GET http://localhost:8091/auth/api/v1/auth/admin/sessions \
  -H "Authorization: Bearer $TOKEN"
```

**Response: 403 Forbidden**
```json
{
  "code": "200",
  "type": "ACCESS_DENIED",
  "message": "You do not have permission to perform this action.",
  "timestamp": "2026-01-02T14:30:00"
}
```

### Test Resource Not Found

```bash
curl -X GET http://localhost:8091/auth/api/v1/auth/user/nonexistent \
  -H "Authorization: Bearer $TOKEN"
```

**Response: 404 Not Found**
```json
{
  "code": "301",
  "type": "USER_NOT_FOUND",
  "message": "User 'nonexistent' not found",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

## Client-Side Error Handling

### JavaScript/TypeScript Example

```typescript
interface ApiErrorResponse {
  code: string;
  type: string;
  message: string;
  timestamp: string;
  fieldErrors?: Array<{
    field: string;
    message: string;
  }>;
}

async function login(username: string, password: string) {
  try {
    const response = await fetch('http://localhost:8091/auth/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, entityCode: 'APP001' })
    });

    if (!response.ok) {
      const error: ApiErrorResponse = await response.json();

      // Handle specific error codes
      switch (error.code) {
        case '101': // INVALID_CREDENTIALS
          alert('Invalid username or password');
          break;
        case '104': // ACCOUNT_DISABLED
          alert('Your account has been disabled. Contact support.');
          break;
        case '105': // ACCOUNT_LOCKED
          alert('Your account has been locked. Contact support.');
          break;
        case '003': // VALIDATION_ERROR
          // Display field-level errors
          error.fieldErrors?.forEach(fieldError => {
            console.error(`${fieldError.field}: ${fieldError.message}`);
          });
          break;
        default:
          alert(error.message);
      }

      return null;
    }

    return await response.json();
  } catch (e) {
    console.error('Network error:', e);
    alert('Unable to connect to server');
    return null;
  }
}
```

### React Example with Form Validation

```typescript
import React, { useState } from 'react';

interface FieldError {
  field: string;
  message: string;
}

function LoginForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    try {
      const response = await fetch('/auth/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, entityCode: 'APP001' })
      });

      if (!response.ok) {
        const error = await response.json();

        if (error.fieldErrors) {
          // Convert field errors to map
          const fieldErrorMap: Record<string, string> = {};
          error.fieldErrors.forEach((fe: FieldError) => {
            fieldErrorMap[fe.field] = fe.message;
          });
          setErrors(fieldErrorMap);
        } else {
          setGeneralError(error.message);
        }

        return;
      }

      // Success
      const data = await response.json();
      localStorage.setItem('token', data.data.token);
      window.location.href = '/dashboard';
    } catch (e) {
      setGeneralError('Unable to connect to server');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {generalError && <div className="error">{generalError}</div>}

      <input name="username" />
      {errors.username && <span className="error">{errors.username}</span>}

      <input name="password" type="password" />
      {errors.password && <span className="error">{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Summary

The auth-service exception handling system provides:

✅ **Centralized** - All exceptions handled in one place (GlobalExceptionHandler)
✅ **Standardized** - Consistent error response format (ApiErrorResponse)
✅ **Categorized** - Organized error codes by type (ErrorCode enum)
✅ **Type-safe** - Custom exception classes for different scenarios
✅ **Informative** - Meaningful error messages and codes
✅ **Secure** - Generic messages for authentication failures
✅ **Comprehensive** - Handles Spring Security, validation, database, and HTTP errors
✅ **Maintainable** - Easy to add new error codes and exception types

**This is production-ready exception handling following enterprise best practices!**

---

**Version:** 1.0
**Last Updated:** 2026-01-02
**Author:** Auth Service Team
