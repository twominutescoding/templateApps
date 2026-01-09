# Exception Handling Guide

## Overview

This application uses a comprehensive exception handling system that provides:
- **Standardized error responses** across all endpoints
- **Custom exception hierarchy** for different error categories
- **Centralized error handling** via GlobalExceptionHandler
- **Detailed error codes** for client-side error handling
- **Field-level validation errors** for form validation
- **Proper HTTP status code mapping**

## Architecture

### Exception Hierarchy

```
BaseException (extends RuntimeException)
├── CustomValidationException         - Validation errors (400)
├── CustomAuthenticationException      - Authentication failures (401)
├── CustomAuthorizationException       - Authorization failures (403)
├── ResourceNotFoundException          - Entity not found (404)
├── InternalDatabaseException          - Database errors (500)
├── InternalApiException               - Internal API errors (500)
└── ExternalServiceException           - External service failures (503)
```

### Error Response Format

All errors return `ApiErrorResponse`:

```json
{
  "code": "101",
  "type": "INVALID_CREDENTIALS",
  "message": "Invalid username or password.",
  "timestamp": "2025-01-03T12:30:45",
  "fieldErrors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

## Exception Types

### 1. CustomValidationException

**When to use**: Validation errors with field-level details

**HTTP Status**: 400 BAD REQUEST

**Example**:
```java
List<ApiErrorResponse.FieldError> errors = new ArrayList<>();
errors.add(new ApiErrorResponse.FieldError("username", "Username is required"));
errors.add(new ApiErrorResponse.FieldError("email", "Invalid email format"));

throw new CustomValidationException("Validation failed", errors);
```

**Error Response**:
```json
{
  "code": "003",
  "type": "VALIDATION_ERROR",
  "message": "Validation failed",
  "fieldErrors": [
    {"field": "username", "message": "Username is required"},
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

### 2. CustomAuthenticationException

**When to use**: Authentication failures (invalid credentials, expired tokens, etc.)

**HTTP Status**: 401 UNAUTHORIZED

**Example**:
```java
// Simple authentication error
throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);

// With custom message
throw new CustomAuthenticationException(
    ErrorCode.TOKEN_EXPIRED,
    "Your session has expired. Please login again."
);

// With cause
throw new CustomAuthenticationException(
    ErrorCode.EXTERNAL_AUTH_ERROR,
    "External authentication failed: " + e.getMessage(),
    e
);
```

**Error Response**:
```json
{
  "code": "101",
  "type": "INVALID_CREDENTIALS",
  "message": "Invalid username or password."
}
```

### 3. CustomAuthorizationException

**When to use**: Authorization failures (insufficient permissions, access denied)

**HTTP Status**: 403 FORBIDDEN

**Example**:
```java
// User doesn't have required role
throw new CustomAuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS);

// With custom message
throw new CustomAuthorizationException(
    ErrorCode.ACCESS_DENIED,
    "You need ADMIN role to access this resource."
);
```

**Error Response**:
```json
{
  "code": "201",
  "type": "ACCESS_DENIED",
  "message": "You do not have permission to perform this action."
}
```

### 4. ResourceNotFoundException

**When to use**: Entity or resource not found

**HTTP Status**: 404 NOT FOUND

**Example**:
```java
// Using ErrorCode (recommended)
User user = userRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

Product product = productRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND));

// With custom message
throw new ResourceNotFoundException(
    ErrorCode.ENTITY_NOT_FOUND,
    "Product with ID " + id + " not found"
);

// Legacy format (deprecated but still supported)
throw new ResourceNotFoundException("Product", "id", id);
```

**Error Response**:
```json
{
  "code": "301",
  "type": "USER_NOT_FOUND",
  "message": "User not found."
}
```

### 5. InternalDatabaseException

**When to use**: Database-related errors (connection failures, constraint violations handled internally)

**HTTP Status**: 500 INTERNAL SERVER ERROR

**Example**:
```java
try {
    repository.save(entity);
} catch (DataAccessException e) {
    throw new InternalDatabaseException(
        ErrorCode.DATABASE_ERROR,
        "Failed to save entity",
        e
    );
}
```

**Error Response**:
```json
{
  "code": "401",
  "type": "DATABASE_ERROR",
  "message": "Database operation failed."
}
```

### 6. InternalApiException

**When to use**: Unexpected internal errors (not database or external service related)

**HTTP Status**: 500 INTERNAL SERVER ERROR

**Example**:
```java
try {
    String token = jwtUtil.generateToken(userDetails);
} catch (JwtException e) {
    throw new InternalApiException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "Failed to generate JWT token",
        e
    );
}
```

**Error Response**:
```json
{
  "code": "000",
  "type": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred."
}
```

### 7. ExternalServiceException

**When to use**: External service integration failures (auth-service, payment gateways, third-party APIs)

**HTTP Status**: 503 SERVICE UNAVAILABLE

**Example**:
```java
try {
    ExternalAuthResponse response = externalAuthService.authenticate(username, password);
} catch (RestClientException e) {
    throw new ExternalServiceException(
        ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        "Authentication service is unavailable",
        e
    );
}

// Auth service returned error
throw new ExternalServiceException(
    ErrorCode.EXTERNAL_AUTH_ERROR,
    "External authentication failed: " + errorMessage
);

// Timeout
throw new ExternalServiceException(
    ErrorCode.EXTERNAL_SERVICE_TIMEOUT,
    "Payment gateway request timed out"
);
```

**Error Response**:
```json
{
  "code": "500",
  "type": "EXTERNAL_AUTH_ERROR",
  "message": "External authentication service failed."
}
```

## Error Code Categories

Error codes are organized by category:

| Range   | Category          | HTTP Status | Examples                          |
|---------|-------------------|-------------|-----------------------------------|
| 000-099 | General Errors    | 400/500     | INTERNAL_SERVER_ERROR, VALIDATION_ERROR |
| 100-199 | Authentication    | 401         | INVALID_CREDENTIALS, TOKEN_EXPIRED |
| 200-299 | Authorization     | 403         | ACCESS_DENIED, INSUFFICIENT_PERMISSIONS |
| 300-399 | Resources         | 404         | USER_NOT_FOUND, PRODUCT_NOT_FOUND |
| 400-499 | Database          | 409/500     | DATABASE_ERROR, DATA_INTEGRITY_ERROR |
| 500-599 | External Services | 503         | EXTERNAL_AUTH_ERROR, EXTERNAL_SERVICE_UNAVAILABLE |
| 600-699 | Business Logic    | 400/409     | BUSINESS_RULE_VIOLATION, DUPLICATE_ENTRY |

## GlobalExceptionHandler

The `@RestControllerAdvice` class handles all exceptions and converts them to standardized `ApiErrorResponse`:

### Handled Exceptions

**Custom Application Exceptions (7 handlers)**:
- CustomValidationException → 400 BAD REQUEST
- CustomAuthenticationException → 401 UNAUTHORIZED
- CustomAuthorizationException → 403 FORBIDDEN
- ResourceNotFoundException → 404 NOT FOUND
- InternalDatabaseException → 500 INTERNAL SERVER ERROR
- InternalApiException → 500 INTERNAL SERVER ERROR
- ExternalServiceException → 503 SERVICE UNAVAILABLE

**Spring Security Exceptions (2 handlers)**:
- AuthenticationException (BadCredentialsException, DisabledException, LockedException) → 401
- AccessDeniedException → 403

**Spring Validation Exceptions (3 handlers)**:
- MethodArgumentNotValidException (from @Valid) → 400
- MethodArgumentTypeMismatchException → 400
- MissingServletRequestParameterException → 400

**Database Exceptions (2 handlers)**:
- DataIntegrityViolationException (unique constraints, foreign keys) → 409 CONFLICT
- LazyInitializationException → 500

**HTTP Protocol Exceptions (3 handlers)**:
- HttpRequestMethodNotSupportedException → 405 METHOD NOT ALLOWED
- HttpMediaTypeNotSupportedException → 415 UNSUPPORTED MEDIA TYPE
- HttpMessageNotReadableException (malformed JSON) → 400

**Generic Exception (1 handler)**:
- Exception (fallback for unexpected errors) → 500

## Best Practices

### 1. Choose the Right Exception Type

**Authentication vs Authorization**:
```java
// Authentication - user identity verification
if (!passwordMatches) {
    throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);
}

// Authorization - permission check
if (!user.hasRole("ADMIN")) {
    throw new CustomAuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS);
}
```

### 2. Provide Meaningful Messages

```java
// ❌ Bad - generic message
throw new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND);

// ✅ Good - specific message
throw new ResourceNotFoundException(
    ErrorCode.PRODUCT_NOT_FOUND,
    "Product with ID " + productId + " not found in catalog"
);
```

### 3. Include Field-Level Errors for Validation

```java
// ✅ Good - detailed validation errors
List<ApiErrorResponse.FieldError> errors = new ArrayList<>();

if (username == null || username.isBlank()) {
    errors.add(new ApiErrorResponse.FieldError("username", "Username is required"));
}

if (email != null && !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
    errors.add(new ApiErrorResponse.FieldError("email", "Invalid email format"));
}

if (!errors.isEmpty()) {
    throw new CustomValidationException("Registration validation failed", errors);
}
```

### 4. Preserve Exception Causes

```java
// ✅ Good - includes cause for debugging
try {
    externalAuthService.authenticate(username, password);
} catch (RestClientException e) {
    throw new ExternalServiceException(
        ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        "Auth service unavailable: " + e.getMessage(),
        e  // ← Include cause
    );
}
```

### 5. Use ErrorCode for Consistency

```java
// ❌ Bad - hardcoded messages
throw new CustomAuthenticationException(
    ErrorCode.AUTHENTICATION_ERROR,
    "Invalid username or password"
);

// ✅ Good - use ErrorCode default message
throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);
```

### 6. Let GlobalExceptionHandler Handle Spring Exceptions

```java
// ❌ Bad - manually catching Spring Security exceptions
try {
    authenticationManager.authenticate(token);
} catch (BadCredentialsException e) {
    throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);
}

// ✅ Good - let Spring Security exception propagate
// GlobalExceptionHandler will automatically convert it
authenticationManager.authenticate(token);
```

## Frontend Integration

### Error Response Type

```typescript
interface ApiErrorResponse {
  code: string;
  type: string;
  message: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

interface FieldError {
  field: string;
  message: string;
}
```

### Handling Errors

```typescript
try {
  const response = await api.login(username, password);
  // Success
} catch (error) {
  if (error.response?.data) {
    const errorResponse: ApiErrorResponse = error.response.data;

    // Display message to user
    console.error(errorResponse.message);

    // Handle field errors
    if (errorResponse.fieldErrors) {
      errorResponse.fieldErrors.forEach(fieldError => {
        // Show error next to field
        setFieldError(fieldError.field, fieldError.message);
      });
    }

    // Handle specific error codes
    if (errorResponse.code === '101') {
      // Invalid credentials - show specific UI
    }
  }
}
```

## Common Scenarios

### User Registration

```java
@PostMapping("/register")
public ResponseEntity<ApiResponse<UserDTO>> register(@Valid @RequestBody RegisterRequest request) {
    // Check if username exists
    if (userRepository.findByUsername(request.getUsername()).isPresent()) {
        List<ApiErrorResponse.FieldError> errors = new ArrayList<>();
        errors.add(new ApiErrorResponse.FieldError(
            "username",
            "Username '" + request.getUsername() + "' is already taken"
        ));
        throw new CustomValidationException("Registration failed", errors);
    }

    // Create user
    User user = userService.createUser(request);
    return ResponseEntity.ok(ApiResponse.success(userMapper.toDTO(user)));
}
```

### Product Update

```java
@PutMapping("/{id}")
public ResponseEntity<ApiResponse<ProductDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody ProductRequest request) {

    // Find product (throws ResourceNotFoundException if not found)
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND));

    // Check authorization
    if (!currentUser.canModifyProduct(product)) {
        throw new CustomAuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    // Update product
    try {
        product = productService.update(product, request);
        return ResponseEntity.ok(ApiResponse.success(productMapper.toDTO(product)));
    } catch (DataIntegrityViolationException e) {
        throw new InternalDatabaseException(
            ErrorCode.DATA_INTEGRITY_ERROR,
            "Failed to update product: constraint violation",
            e
        );
    }
}
```

### External Authentication

```java
public LoginResponse authenticateWithExternalService(String username, String password) {
    try {
        ExternalAuthResponse authResponse = externalAuthService.authenticate(username, password);

        if (!authResponse.isSuccess() || authResponse.getData() == null) {
            throw new CustomAuthenticationException(
                ErrorCode.EXTERNAL_AUTH_ERROR,
                "Authentication failed: " + authResponse.getMessage()
            );
        }

        return buildLoginResponse(authResponse);

    } catch (RestClientException e) {
        throw new ExternalServiceException(
            ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
            "Authentication service unavailable: " + e.getMessage(),
            e
        );
    }
}
```

## Migration from RuntimeException

If you have existing code using `RuntimeException`, replace it with appropriate custom exceptions:

```java
// Before:
throw new RuntimeException("User not found");

// After:
throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND);

// Before:
throw new RuntimeException("Invalid credentials");

// After:
throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);

// Before:
throw new RuntimeException("Access denied");

// After:
throw new CustomAuthorizationException(ErrorCode.ACCESS_DENIED);
```

See `EXCEPTION_MIGRATION_GUIDE.md` for detailed migration instructions.

## Testing

### Unit Tests

```java
@Test
void testLogin_InvalidCredentials_ThrowsException() {
    // Arrange
    when(authenticationManager.authenticate(any()))
        .thenThrow(new BadCredentialsException("Invalid credentials"));

    // Act & Assert
    assertThrows(BadCredentialsException.class, () -> {
        authService.authenticate("user", "wrongpassword");
    });
}

@Test
void testFindUser_NotFound_ThrowsException() {
    // Arrange
    when(userRepository.findById(999L)).thenReturn(Optional.empty());

    // Act & Assert
    ResourceNotFoundException exception = assertThrows(
        ResourceNotFoundException.class,
        () -> userService.findById(999L)
    );

    assertEquals(ErrorCode.USER_NOT_FOUND, exception.getErrorCode());
}
```

### Integration Tests

```java
@Test
void testLogin_InvalidCredentials_Returns401() throws Exception {
    LoginRequest request = new LoginRequest("user", "wrongpassword");

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("101"))
        .andExpect(jsonPath("$.type").value("INVALID_CREDENTIALS"))
        .andExpect(jsonPath("$.message").exists());
}
```

## Logging

All exceptions are automatically logged by GlobalExceptionHandler:

- **WARN level**: Client errors (4xx) - authentication, authorization, validation, not found
- **ERROR level**: Server errors (5xx) - database, internal, external service failures

The logs include:
- Request URI
- Error message
- Full stack trace (for ERROR level)

## Summary

- ✅ Use custom exceptions instead of `RuntimeException`
- ✅ Choose the right exception type for the error scenario
- ✅ Include meaningful error messages
- ✅ Provide field-level errors for validation
- ✅ Preserve exception causes for debugging
- ✅ Use ErrorCode enum for consistency
- ✅ Let GlobalExceptionHandler convert Spring exceptions
- ✅ Return standardized ApiErrorResponse to clients

For more details, see:
- `ErrorCode.java` - All error codes with default messages
- `GlobalExceptionHandler.java` - Exception handling logic
- `EXCEPTION_MIGRATION_GUIDE.md` - Migration instructions
