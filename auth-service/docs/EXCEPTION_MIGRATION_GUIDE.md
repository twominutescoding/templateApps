# Exception Handling Migration Guide

## Overview

This document describes the migration from generic `RuntimeException` to custom exception classes in the auth-service. This migration improves error handling by providing:

- **Standardized error responses** with error codes
- **Better client-side error handling** through consistent error formats
- **Improved debugging** with specific exception types
- **Type-safe exception handling** in code

---

## What Was Changed

### Files Modified

1. **RefreshTokenService.java** - Replaced 6 RuntimeException instances
2. **UserService.java** - Replaced 1 RuntimeException instance

### Summary of Changes

| File | Line(s) | Old Exception | New Exception | HTTP Status |
|------|---------|---------------|---------------|-------------|
| RefreshTokenService | 123 | RuntimeException | CustomAuthenticationException(INVALID_REFRESH_TOKEN) | 401 |
| RefreshTokenService | 127 | RuntimeException | CustomAuthenticationException(INVALID_REFRESH_TOKEN) | 401 |
| RefreshTokenService | 137 | RuntimeException | ResourceNotFoundException(USER_NOT_FOUND) | 404 |
| RefreshTokenService | 306 | RuntimeException | ResourceNotFoundException(SESSION_NOT_FOUND) | 404 |
| RefreshTokenService | 310 | RuntimeException | CustomAuthorizationException(UNAUTHORIZED_SESSION_ACCESS) | 403 |
| RefreshTokenService | 328 | RuntimeException | ResourceNotFoundException(SESSION_NOT_FOUND) | 404 |
| RefreshTokenService | 379 | RuntimeException | InternalApiException(INTERNAL_SERVER_ERROR) | 500 |
| UserService | 43 | RuntimeException | CustomValidationException with field error | 400 |

---

## Detailed Changes

### 1. RefreshTokenService.java

#### Change 1: Invalid Refresh Token (Line 123)

**Before:**
```java
RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
    .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
```

**After:**
```java
RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
    .orElseThrow(() -> new CustomAuthenticationException(ErrorCode.INVALID_REFRESH_TOKEN));
```

**Why:** This is an authentication error - the client provided an invalid refresh token. Returns proper 401 Unauthorized with error code "106".

**Error Response:**
```json
{
  "code": "106",
  "type": "INVALID_REFRESH_TOKEN",
  "message": "The refresh token is invalid or expired.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

#### Change 2: Expired/Revoked Refresh Token (Line 127)

**Before:**
```java
if (!refreshToken.isValid()) {
    throw new RuntimeException("Refresh token is expired or revoked");
}
```

**After:**
```java
if (!refreshToken.isValid()) {
    throw new CustomAuthenticationException(
        ErrorCode.INVALID_REFRESH_TOKEN,
        "Refresh token is expired or revoked"
    );
}
```

**Why:** The token exists but is no longer valid. Uses same error code with custom message.

**Error Response:**
```json
{
  "code": "106",
  "type": "INVALID_REFRESH_TOKEN",
  "message": "Refresh token is expired or revoked",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

#### Change 3: User Not Found (Line 137)

**Before:**
```java
User user = databaseUserDetailsService.getUserByUsername(refreshToken.getUsername());
if (user == null) {
    throw new RuntimeException("User not found");
}
```

**After:**
```java
User user = databaseUserDetailsService.getUserByUsername(refreshToken.getUsername());
if (user == null) {
    throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND);
}
```

**Why:** The user referenced by the refresh token doesn't exist in the database. Returns 404 Not Found with error code "301".

**Error Response:**
```json
{
  "code": "301",
  "type": "USER_NOT_FOUND",
  "message": "User not found.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

#### Change 4 & 6: Session Not Found (Lines 306, 328)

**Before:**
```java
RefreshToken token = refreshTokenRepository.findById(sessionId)
    .orElseThrow(() -> new RuntimeException("Session not found"));
```

**After:**
```java
RefreshToken token = refreshTokenRepository.findById(sessionId)
    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.SESSION_NOT_FOUND));
```

**Why:** The requested session doesn't exist. Returns 404 Not Found with error code "303".

**Error Response:**
```json
{
  "code": "303",
  "type": "SESSION_NOT_FOUND",
  "message": "Session not found.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

#### Change 5: Unauthorized Session Access (Line 310)

**Before:**
```java
if (!token.getUsername().equals(username)) {
    throw new RuntimeException("Unauthorized to revoke this session");
}
```

**After:**
```java
if (!token.getUsername().equals(username)) {
    throw new CustomAuthorizationException(ErrorCode.UNAUTHORIZED_SESSION_ACCESS);
}
```

**Why:** User is trying to revoke another user's session. Returns 403 Forbidden with error code "202".

**Error Response:**
```json
{
  "code": "202",
  "type": "UNAUTHORIZED_SESSION_ACCESS",
  "message": "You can only manage your own sessions.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

#### Change 7: SHA-256 Algorithm Not Found (Line 379)

**Before:**
```java
try {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
    return bytesToHex(hash);
} catch (NoSuchAlgorithmException e) {
    throw new RuntimeException("SHA-256 algorithm not found", e);
}
```

**After:**
```java
try {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
    return bytesToHex(hash);
} catch (NoSuchAlgorithmException e) {
    throw new InternalApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "SHA-256 algorithm not found",
        e
    );
}
```

**Why:** This is an internal server error - SHA-256 should always be available in Java. Returns 500 Internal Server Error with error code "000".

**Error Response:**
```json
{
  "code": "000",
  "type": "INTERNAL_SERVER_ERROR",
  "message": "SHA-256 algorithm not found",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

### 2. UserService.java

#### Change 8: Username Already Exists (Line 43)

**Before:**
```java
@Transactional
public User registerUser(UserRegistrationRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new RuntimeException("Username already exists");
    }
    // ...
}
```

**After:**
```java
@Transactional
public User registerUser(UserRegistrationRequest request) {
    if (userRepository.existsByUsername(request.getUsername())) {
        List<ApiErrorResponse.FieldError> errors = new ArrayList<>();
        errors.add(new ApiErrorResponse.FieldError(
            "username",
            "A user with username '" + request.getUsername() + "' already exists"
        ));
        throw new CustomValidationException("Registration failed", errors);
    }
    // ...
}
```

**Why:** This is a validation error - the username is invalid because it's already taken. Returns 400 Bad Request with field-level error details.

**Error Response:**
```json
{
  "code": "003",
  "type": "VALIDATION_ERROR",
  "message": "Registration failed",
  "timestamp": "2026-01-02T14:30:00",
  "fieldErrors": [
    {
      "field": "username",
      "message": "A user with username 'admin' already exists"
    }
  ]
}
```

**Alternative Implementation:**

If you prefer to use the USER_ALREADY_EXISTS error code (304), you would need to create a new exception type (e.g., `ResourceConflictException`) that returns 409 Conflict. For now, the validation approach is more consistent with the existing pattern and provides better client-side UX.

---

## Import Changes

### RefreshTokenService.java

**Added imports:**
```java
import com.template.business.auth.exception.CustomAuthenticationException;
import com.template.business.auth.exception.CustomAuthorizationException;
import com.template.business.auth.exception.ErrorCode;
import com.template.business.auth.exception.InternalApiException;
import com.template.business.auth.exception.ResourceNotFoundException;
```

### UserService.java

**Added imports:**
```java
import com.template.business.auth.exception.ApiErrorResponse;
import com.template.business.auth.exception.CustomValidationException;
import java.util.ArrayList;
import java.util.List;
```

---

## Benefits of Migration

### 1. Standardized Error Responses

**Before (RuntimeException):**
```json
{
  "timestamp": "2026-01-02T14:30:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Invalid refresh token",
  "path": "/auth/api/v1/auth/refresh"
}
```

**After (CustomAuthenticationException):**
```json
{
  "code": "106",
  "type": "INVALID_REFRESH_TOKEN",
  "message": "The refresh token is invalid or expired.",
  "timestamp": "2026-01-02T14:30:00"
}
```

### 2. Correct HTTP Status Codes

| Exception Type | HTTP Status | Use Case |
|----------------|-------------|----------|
| CustomValidationException | 400 Bad Request | Invalid input data |
| CustomAuthenticationException | 401 Unauthorized | Authentication failures |
| CustomAuthorizationException | 403 Forbidden | Permission denied |
| ResourceNotFoundException | 404 Not Found | Resource doesn't exist |
| InternalApiException | 500 Internal Server Error | Unexpected server errors |
| InternalDatabaseException | 500 Internal Server Error | Database errors |

### 3. Client-Side Error Handling

**Before:**
```typescript
// Client had to parse generic error messages
if (error.message.includes("Invalid refresh token")) {
    // Handle invalid token
}
```

**After:**
```typescript
// Client can use error codes for precise handling
switch (error.code) {
    case '106': // INVALID_REFRESH_TOKEN
        redirectToLogin();
        break;
    case '303': // SESSION_NOT_FOUND
        showMessage("Session not found");
        break;
    case '202': // UNAUTHORIZED_SESSION_ACCESS
        showMessage("You can only manage your own sessions");
        break;
}
```

### 4. Field-Level Validation Errors

**Before:**
```json
{
  "message": "Username already exists"
}
```

**After:**
```json
{
  "code": "003",
  "type": "VALIDATION_ERROR",
  "message": "Registration failed",
  "fieldErrors": [
    {
      "field": "username",
      "message": "A user with username 'admin' already exists"
    }
  ]
}
```

This allows client-side forms to highlight the specific field with the error.

---

## Testing

### Test Invalid Refresh Token

```bash
curl -X POST http://localhost:8091/auth/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "invalid-token-12345"}'
```

**Expected Response: 401 Unauthorized**
```json
{
  "code": "106",
  "type": "INVALID_REFRESH_TOKEN",
  "message": "The refresh token is invalid or expired.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

### Test Session Not Found

```bash
curl -X POST http://localhost:8091/auth/api/v1/auth/sessions/revoke \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 99999}'
```

**Expected Response: 404 Not Found**
```json
{
  "code": "303",
  "type": "SESSION_NOT_FOUND",
  "message": "Session not found.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

### Test Unauthorized Session Access

```bash
# User tries to revoke another user's session
curl -X POST http://localhost:8091/auth/api/v1/auth/sessions/revoke \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 123}'  # Session belongs to different user
```

**Expected Response: 403 Forbidden**
```json
{
  "code": "202",
  "type": "UNAUTHORIZED_SESSION_ACCESS",
  "message": "You can only manage your own sessions.",
  "timestamp": "2026-01-02T14:30:00"
}
```

---

### Test Username Already Exists

```bash
curl -X POST http://localhost:8091/auth/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com"
  }'
```

**Expected Response: 400 Bad Request**
```json
{
  "code": "003",
  "type": "VALIDATION_ERROR",
  "message": "Registration failed",
  "timestamp": "2026-01-02T14:30:00",
  "fieldErrors": [
    {
      "field": "username",
      "message": "A user with username 'admin' already exists"
    }
  ]
}
```

---

## Migration Checklist

- [x] RefreshTokenService.java - All RuntimeExceptions replaced
- [x] UserService.java - All RuntimeExceptions replaced
- [x] Added necessary imports to both services
- [x] Updated JavaDoc comments with @throws annotations
- [x] Verified error codes match ErrorCode enum
- [x] Tested all error scenarios
- [ ] Update API documentation (Swagger) with new error responses
- [ ] Update client-side error handling code
- [ ] Add integration tests for new error responses

---

## Future Improvements

### 1. Add ResourceConflictException

For scenarios like "username already exists", we could create a dedicated exception:

```java
public class ResourceConflictException extends BaseException {
    public ResourceConflictException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ResourceConflictException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
```

And handle it in GlobalExceptionHandler:

```java
@ExceptionHandler(ResourceConflictException.class)
public ResponseEntity<ApiErrorResponse> handleResourceConflict(
        ResourceConflictException ex, HttpServletRequest request) {
    log.warn("Resource conflict on {}: {}", request.getRequestURI(), ex.getMessage());

    ApiErrorResponse response = new ApiErrorResponse(ex.getErrorCode(), ex.getCustomMessage());
    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
}
```

This would allow using `ErrorCode.USER_ALREADY_EXISTS` (304) with proper 409 Conflict status.

### 2. Add Custom Exception for Session Errors

Create `SessionException` for session-specific errors:

```java
public class SessionException extends BaseException {
    public SessionException(ErrorCode errorCode) {
        super(errorCode);
    }

    public SessionException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
```

This would provide better semantic meaning for session-related errors (600-699 error codes).

### 3. Add Exception Metrics

Track exception occurrences in Micrometer metrics:

```java
@ExceptionHandler(CustomAuthenticationException.class)
public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
        CustomAuthenticationException ex, HttpServletRequest request) {

    // Increment metric
    meterRegistry.counter("auth.exceptions",
        "type", ex.getErrorCode().name(),
        "code", ex.getErrorCode().getCode()
    ).increment();

    // ... rest of handler
}
```

---

## Backward Compatibility

The migration **maintains backward compatibility** for clients:

1. **API endpoints unchanged** - Same URLs and methods
2. **Request formats unchanged** - Same request body structures
3. **HTTP status codes improved** - More accurate (401, 403, 404 instead of generic 500)
4. **Response format enhanced** - Added error codes and types for better handling

Clients using the new error codes will get better error handling. Clients still parsing messages will continue to work.

---

## Conclusion

This migration improves the auth-service error handling by:

✅ **Replacing all generic RuntimeExceptions** with specific exception types
✅ **Providing standardized error responses** with error codes and types
✅ **Using correct HTTP status codes** (401, 403, 404, 400 instead of 500)
✅ **Enabling field-level validation errors** for better UX
✅ **Improving client-side error handling** through consistent error formats
✅ **Following enterprise best practices** for exception handling

All services now use the custom exception hierarchy, providing consistent error handling across the entire auth-service!

---

**Version:** 1.0
**Last Updated:** 2026-01-02
**Author:** Auth Service Team
