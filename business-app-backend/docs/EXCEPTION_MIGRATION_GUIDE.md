# Exception Migration Guide

## Overview

This guide helps you migrate existing code from generic `RuntimeException` to the new custom exception handling system.

**Benefits of migration**:
- ✅ Standardized error responses across the API
- ✅ Proper HTTP status codes (401, 403, 404, etc.)
- ✅ Detailed error codes for client-side handling
- ✅ Field-level validation errors
- ✅ Better logging and debugging
- ✅ Consistent error handling patterns

## Migration Status

### ✅ Completed Migrations

**AuthService.java** (2 instances):
- Line 71: User not found after authentication → `ResourceNotFoundException`
- Line 113: External authentication failure → `CustomAuthenticationException`

**ExternalAuthService.java** (3 instances):
- Line 67: External auth unsuccessful response → `CustomAuthenticationException`
- Line 71: External auth non-OK status → `CustomAuthenticationException`
- Line 76: External service unavailable → `ExternalServiceException`

### ⚠️ Optional Migrations

**DemoProductService.java** (4 instances):

These are in the demo package and can be:
- **Migrated** if you plan to keep the demo code
- **Ignored** if you plan to delete the demo package

| Line | Current Code | Recommended Change |
|------|-------------|-------------------|
| 39 | `throw new RuntimeException("Product not found with id: " + id);` | `throw new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found with id: " + id);` |
| 54 | `throw new RuntimeException("Product not found with id: " + id);` | `throw new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found with id: " + id);` |
| 72 | `throw new RuntimeException("Product not found with id: " + id);` | `throw new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found with id: " + id);` |
| 89 | `throw new RuntimeException("Product not found with id: " + id);` | `throw new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found with id: " + id);` |

## Quick Reference

### Before/After Examples

#### Not Found Errors

```java
// ❌ Before
User user = userRepository.findById(id)
    .orElseThrow(() -> new RuntimeException("User not found"));

// ✅ After
User user = userRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

// ✅ After (with custom message)
Product product = productRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException(
        ErrorCode.PRODUCT_NOT_FOUND,
        "Product not found with id: " + id
    ));
```

#### Authentication Errors

```java
// ❌ Before
if (!passwordMatches) {
    throw new RuntimeException("Invalid credentials");
}

// ✅ After
if (!passwordMatches) {
    throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);
}

// ❌ Before
throw new RuntimeException("Authentication failed: " + e.getMessage());

// ✅ After
throw new CustomAuthenticationException(
    ErrorCode.EXTERNAL_AUTH_ERROR,
    "Authentication failed: " + e.getMessage(),
    e
);
```

#### Authorization Errors

```java
// ❌ Before
if (!user.hasRole("ADMIN")) {
    throw new RuntimeException("Access denied");
}

// ✅ After
if (!user.hasRole("ADMIN")) {
    throw new CustomAuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS);
}

// ✅ After (with custom message)
if (!user.canModifyResource(resource)) {
    throw new CustomAuthorizationException(
        ErrorCode.ACCESS_DENIED,
        "You can only modify your own resources"
    );
}
```

#### Validation Errors

```java
// ❌ Before
if (username == null || username.isBlank()) {
    throw new RuntimeException("Username is required");
}

// ✅ After (simple validation)
if (username == null || username.isBlank()) {
    throw new CustomValidationException(
        ErrorCode.VALIDATION_ERROR,
        "Username is required"
    );
}

// ✅ After (multiple field errors)
List<ApiErrorResponse.FieldError> errors = new ArrayList<>();

if (username == null || username.isBlank()) {
    errors.add(new ApiErrorResponse.FieldError("username", "Username is required"));
}

if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
    errors.add(new ApiErrorResponse.FieldError("email", "Invalid email format"));
}

if (!errors.isEmpty()) {
    throw new CustomValidationException("Validation failed", errors);
}
```

#### External Service Errors

```java
// ❌ Before
try {
    externalService.call();
} catch (Exception e) {
    throw new RuntimeException("Service unavailable: " + e.getMessage(), e);
}

// ✅ After
try {
    externalService.call();
} catch (RestClientException e) {
    throw new ExternalServiceException(
        ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
        "Authentication service unavailable: " + e.getMessage(),
        e
    );
}

// ✅ After (specific external auth error)
if (!authResponse.isSuccess()) {
    throw new CustomAuthenticationException(
        ErrorCode.EXTERNAL_AUTH_ERROR,
        "Authentication failed: " + authResponse.getMessage()
    );
}
```

#### Database Errors

```java
// ❌ Before
try {
    repository.save(entity);
} catch (DataAccessException e) {
    throw new RuntimeException("Database error: " + e.getMessage(), e);
}

// ✅ After
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

#### Internal API Errors

```java
// ❌ Before
try {
    String token = jwtUtil.generateToken(userDetails);
} catch (Exception e) {
    throw new RuntimeException("Token generation failed", e);
}

// ✅ After
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

## Decision Tree

Use this flowchart to choose the right exception:

```
Is it a validation error with field details?
├─ YES → CustomValidationException
└─ NO ↓

Is it an authentication issue (identity verification)?
├─ YES → CustomAuthenticationException
└─ NO ↓

Is it an authorization issue (permission check)?
├─ YES → CustomAuthorizationException
└─ NO ↓

Is it a resource/entity not found?
├─ YES → ResourceNotFoundException
└─ NO ↓

Is it an external service failure?
├─ YES → ExternalServiceException
└─ NO ↓

Is it a database error?
├─ YES → InternalDatabaseException
└─ NO ↓

Is it any other internal error?
└─ YES → InternalApiException
```

## Migration Steps

### Step 1: Add Required Imports

```java
import com.template.business.exception.CustomAuthenticationException;
import com.template.business.exception.CustomAuthorizationException;
import com.template.business.exception.CustomValidationException;
import com.template.business.exception.ErrorCode;
import com.template.business.exception.ExternalServiceException;
import com.template.business.exception.InternalApiException;
import com.template.business.exception.InternalDatabaseException;
import com.template.business.exception.ResourceNotFoundException;
import com.template.business.exception.ApiErrorResponse;
```

### Step 2: Identify RuntimeException Usage

Search your codebase for:
```bash
grep -r "throw new RuntimeException" src/
```

### Step 3: Replace Each Instance

For each RuntimeException:

1. **Determine the error category** (authentication, authorization, not found, etc.)
2. **Choose the appropriate exception type**
3. **Select the matching ErrorCode**
4. **Replace the code**
5. **Add necessary imports**
6. **Test the endpoint**

### Step 4: Verify HTTP Status Codes

Test each migrated endpoint to ensure correct HTTP status:

| Exception Type | Expected HTTP Status |
|----------------|---------------------|
| CustomValidationException | 400 BAD REQUEST |
| CustomAuthenticationException | 401 UNAUTHORIZED |
| CustomAuthorizationException | 403 FORBIDDEN |
| ResourceNotFoundException | 404 NOT FOUND |
| InternalDatabaseException | 500 INTERNAL SERVER ERROR |
| InternalApiException | 500 INTERNAL SERVER ERROR |
| ExternalServiceException | 503 SERVICE UNAVAILABLE |

## Common Patterns

### Pattern 1: Repository findById

```java
// ❌ Before
Optional<Product> productOpt = productRepository.findById(id);
if (productOpt.isEmpty()) {
    throw new RuntimeException("Product not found");
}
Product product = productOpt.get();

// ✅ After
Product product = productRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PRODUCT_NOT_FOUND));
```

### Pattern 2: Username Already Exists

```java
// ❌ Before
if (userRepository.findByUsername(username).isPresent()) {
    throw new RuntimeException("Username already exists");
}

// ✅ After
if (userRepository.findByUsername(username).isPresent()) {
    List<ApiErrorResponse.FieldError> errors = new ArrayList<>();
    errors.add(new ApiErrorResponse.FieldError(
        "username",
        "Username '" + username + "' is already taken"
    ));
    throw new CustomValidationException("Registration failed", errors);
}
```

### Pattern 3: External Service Call

```java
// ❌ Before
public ExternalAuthResponse authenticate(String username, String password) {
    try {
        ResponseEntity<ExternalAuthResponse> response = restTemplate.exchange(...);
        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Authentication failed");
        }
        return response.getBody();
    } catch (Exception e) {
        throw new RuntimeException("Service unavailable: " + e.getMessage(), e);
    }
}

// ✅ After
public ExternalAuthResponse authenticate(String username, String password) {
    try {
        ResponseEntity<ExternalAuthResponse> response = restTemplate.exchange(...);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            ExternalAuthResponse authResponse = response.getBody();
            if (authResponse.isSuccess() && authResponse.getData() != null) {
                return authResponse;
            } else {
                throw new CustomAuthenticationException(
                    ErrorCode.EXTERNAL_AUTH_ERROR,
                    "Authentication failed: " + authResponse.getMessage()
                );
            }
        } else {
            throw new CustomAuthenticationException(
                ErrorCode.EXTERNAL_AUTH_ERROR,
                "Authentication failed"
            );
        }
    } catch (RestClientException e) {
        throw new ExternalServiceException(
            ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
            "Authentication service unavailable: " + e.getMessage(),
            e
        );
    }
}
```

### Pattern 4: Role-Based Authorization

```java
// ❌ Before
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long userId) {
    User currentUser = getCurrentUser();
    if (!currentUser.hasRole("ADMIN")) {
        throw new RuntimeException("Access denied");
    }
    userRepository.deleteById(userId);
}

// ✅ After (let Spring Security handle it)
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long userId) {
    // No manual check needed - Spring Security throws AccessDeniedException
    // GlobalExceptionHandler will convert it to proper response
    userRepository.deleteById(userId);
}

// ✅ After (custom business logic authorization)
public void deleteUser(Long userId, User currentUser) {
    User targetUser = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

    // Custom authorization logic
    if (!currentUser.canDelete(targetUser)) {
        throw new CustomAuthorizationException(
            ErrorCode.ACCESS_DENIED,
            "You can only delete users from your department"
        );
    }

    userRepository.deleteById(userId);
}
```

## ErrorCode Selection Guide

### Authentication (100-199)

| ErrorCode | When to Use |
|-----------|-------------|
| AUTHENTICATION_ERROR | Generic authentication failure |
| INVALID_CREDENTIALS | Wrong username/password |
| TOKEN_EXPIRED | JWT token expired |
| INVALID_TOKEN | JWT token invalid or malformed |
| EXTERNAL_AUTH_ERROR | External auth service returned error |

### Authorization (200-299)

| ErrorCode | When to Use |
|-----------|-------------|
| ACCESS_DENIED | User doesn't have permission |
| INSUFFICIENT_PERMISSIONS | Missing required role/permission |
| ACCOUNT_DISABLED | User account disabled |
| ACCOUNT_LOCKED | User account locked |

### Resources (300-399)

| ErrorCode | When to Use |
|-----------|-------------|
| ENTITY_NOT_FOUND | Generic entity not found |
| USER_NOT_FOUND | User not found |
| PRODUCT_NOT_FOUND | Product not found |

### Database (400-499)

| ErrorCode | When to Use |
|-----------|-------------|
| DATABASE_ERROR | Generic database error |
| DATA_INTEGRITY_ERROR | Constraint violation |
| LAZY_INITIALIZATION_ERROR | Hibernate lazy loading issue |

### External Services (500-599)

| ErrorCode | When to Use |
|-----------|-------------|
| EXTERNAL_AUTH_ERROR | Auth service returned error |
| EXTERNAL_SERVICE_UNAVAILABLE | Service is down/unreachable |
| EXTERNAL_SERVICE_TIMEOUT | Service request timed out |

### Business Logic (600-699)

| ErrorCode | When to Use |
|-----------|-------------|
| BUSINESS_RULE_VIOLATION | Business rule validation failed |
| DUPLICATE_ENTRY | Duplicate entity (e.g., username exists) |

## Testing After Migration

### Unit Test Example

```java
@Test
void testFindProduct_NotFound_ThrowsResourceNotFoundException() {
    // Arrange
    when(productRepository.findById(999L)).thenReturn(Optional.empty());

    // Act & Assert
    ResourceNotFoundException exception = assertThrows(
        ResourceNotFoundException.class,
        () -> productService.findById(999L)
    );

    assertEquals(ErrorCode.PRODUCT_NOT_FOUND, exception.getErrorCode());
}
```

### Integration Test Example

```java
@Test
void testLogin_InvalidCredentials_Returns401WithErrorCode() throws Exception {
    LoginRequest request = new LoginRequest("user", "wrongpassword");

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.code").value("101"))
        .andExpect(jsonPath("$.type").value("INVALID_CREDENTIALS"))
        .andExpect(jsonPath("$.message").value("Invalid username or password."));
}
```

## Backward Compatibility

### ResourceNotFoundException

The `ResourceNotFoundException` maintains backward compatibility with legacy constructor:

```java
// Legacy constructor (still works, but deprecated)
throw new ResourceNotFoundException("Product", "id", productId);

// New constructor (recommended)
throw new ResourceNotFoundException(
    ErrorCode.PRODUCT_NOT_FOUND,
    "Product not found with id: " + productId
);
```

Existing code using the legacy constructor will continue to work but should be migrated to use ErrorCode for consistency.

## Checklist

Use this checklist when migrating a service class:

- [ ] Add necessary imports
- [ ] Find all `throw new RuntimeException(...)` instances
- [ ] Replace each with appropriate custom exception
- [ ] Select correct ErrorCode for each
- [ ] Add field-level errors for validation exceptions
- [ ] Preserve exception causes where applicable
- [ ] Write/update unit tests
- [ ] Write/update integration tests
- [ ] Verify HTTP status codes
- [ ] Test error responses in frontend
- [ ] Update API documentation if needed

## FAQ

**Q: Should I catch Spring Security exceptions and re-throw custom exceptions?**

A: No. GlobalExceptionHandler already handles Spring Security exceptions (BadCredentialsException, AccessDeniedException, etc.) and converts them to proper responses. Let them propagate naturally.

**Q: When should I use CustomAuthenticationException vs letting Spring Security's BadCredentialsException propagate?**

A: Use CustomAuthenticationException for business logic authentication (e.g., external auth service, custom authentication logic). Let Spring Security exceptions propagate for standard username/password authentication.

**Q: Should I migrate the demo package?**

A: Only if you plan to keep it. If you're going to delete the demo package, you can skip migrating `DemoProductService.java`.

**Q: What if I'm not sure which exception type to use?**

A: Refer to the decision tree above, or use the error code categories as a guide. When in doubt, use `InternalApiException` with `ErrorCode.INTERNAL_SERVER_ERROR` and refine later.

**Q: Do I need to catch DataIntegrityViolationException?**

A: No. GlobalExceptionHandler automatically handles it and returns 409 CONFLICT with a user-friendly message.

**Q: Can I create custom error codes?**

A: Yes. Add them to the `ErrorCode` enum following the category ranges (000-099, 100-199, etc.).

## Resources

- `EXCEPTION_HANDLING.md` - Comprehensive exception handling guide
- `ErrorCode.java` - All error codes with default messages
- `GlobalExceptionHandler.java` - Exception handling implementation
- `com.template.business.exception` package - All custom exception classes

## Migration Examples from This Project

### AuthService.java

**Before**:
```java
// Line 71
User user = userRepository.findByUsername(username)
    .orElseThrow(() -> new RuntimeException("User not found"));

// Line 113
throw new RuntimeException("Authentication failed: " + e.getMessage());
```

**After**:
```java
// Line 71
User user = userRepository.findByUsername(username)
    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));

// Line 113
throw new CustomAuthenticationException(
    ErrorCode.EXTERNAL_AUTH_ERROR,
    "Authentication failed: " + e.getMessage(),
    e
);
```

### ExternalAuthService.java

**Before**:
```java
// Line 67
throw new RuntimeException("Authentication failed: " + authResponse.getMessage());

// Line 71
throw new RuntimeException("Authentication failed");

// Line 76
throw new RuntimeException("Authentication service unavailable: " + e.getMessage(), e);
```

**After**:
```java
// Line 67
throw new CustomAuthenticationException(
    ErrorCode.EXTERNAL_AUTH_ERROR,
    "Authentication failed: " + authResponse.getMessage()
);

// Line 71
throw new CustomAuthenticationException(ErrorCode.EXTERNAL_AUTH_ERROR, "Authentication failed");

// Line 76
throw new ExternalServiceException(
    ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
    "Authentication service unavailable: " + e.getMessage(),
    e
);
```

## Summary

✅ **DO**:
- Use appropriate custom exceptions for different error types
- Include meaningful error messages
- Preserve exception causes
- Use ErrorCode enum for consistency
- Add field-level errors for validation
- Let Spring exceptions propagate naturally
- Test HTTP status codes

❌ **DON'T**:
- Use generic RuntimeException
- Hardcode error messages (use ErrorCode defaults when possible)
- Catch and re-throw Spring Security exceptions unnecessarily
- Forget to include the cause when wrapping exceptions
- Skip testing after migration

Happy migrating! 🚀
