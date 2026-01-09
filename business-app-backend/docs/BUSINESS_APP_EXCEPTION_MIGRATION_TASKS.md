# Business App Backend - Exception Handling Migration Tasks

## Overview

Adapt business-app-backend to use the same comprehensive exception handling system as auth-service.

---

## Current State Analysis

### ✅ What Exists
- ✅ Basic GlobalExceptionHandler (4 handlers)
- ✅ ResourceNotFoundException (simple, extends RuntimeException)
- ✅ ApiResponse wrapper with timestamp

### ❌ What's Missing
- ❌ ErrorCode enum with organized error codes
- ❌ ApiErrorResponse with error codes and field-level errors
- ❌ Custom exception hierarchy (BaseException + subclasses)
- ❌ Comprehensive GlobalExceptionHandler
- ❌ Proper exception usage (4 RuntimeExceptions found)

### 🔍 Issues Found

**RuntimeException Usage (4 instances):**
1. `AuthService.java:113` - "Authentication failed"
2. `ExternalAuthService.java:67` - "Authentication failed" (with message)
3. `ExternalAuthService.java:71` - "Authentication failed"
4. `ExternalAuthService.java:76` - "Authentication service unavailable"

---

## Task List

### Phase 1: Create Exception Infrastructure (6 tasks)

#### Task 1.1: Create ErrorCode Enum
**File:** `src/main/java/com/template/business/exception/ErrorCode.java`

**Categories to include:**
- General errors (000-099): INTERNAL_SERVER_ERROR, VALIDATION_ERROR, INVALID_ARGUMENT, etc.
- Authentication errors (100-199): AUTHENTICATION_ERROR, INVALID_CREDENTIALS, INVALID_TOKEN, etc.
- Authorization errors (200-299): ACCESS_DENIED, INSUFFICIENT_PERMISSIONS
- Resource errors (300-399): ENTITY_NOT_FOUND, USER_NOT_FOUND, PRODUCT_NOT_FOUND, etc.
- Database errors (400-499): DATA_INTEGRITY_ERROR, LAZY_INITIALIZATION_ERROR
- External Service errors (500-599): EXTERNAL_AUTH_ERROR, EXTERNAL_SERVICE_UNAVAILABLE
- Business Logic errors (600-699): BUSINESS_RULE_VIOLATION, etc.

**Pattern:** Copy from auth-service and adapt for business app needs

**Estimated complexity:** Medium

---

#### Task 1.2: Create ApiErrorResponse Class
**File:** `src/main/java/com/template/business/exception/ApiErrorResponse.java`

**Fields:**
- `String code` - Error code (e.g., "003")
- `String type` - Error type from enum (e.g., "VALIDATION_ERROR")
- `String message` - Human-readable message
- `LocalDateTime timestamp` - When error occurred
- `List<FieldError> fieldErrors` - Field-level validation errors

**Inner class:**
- `FieldError` with `field` and `message`

**Constructors:**
- `ApiErrorResponse(ErrorCode errorCode, String message)`
- `ApiErrorResponse(ErrorCode errorCode, String message, List<FieldError> fieldErrors)`

**Pattern:** Copy from auth-service

**Estimated complexity:** Easy

---

#### Task 1.3: Create BaseException
**File:** `src/main/java/com/template/business/exception/BaseException.java`

**Features:**
- Extends RuntimeException
- Contains ErrorCode and customMessage
- Multiple constructors for different scenarios

**Pattern:** Copy from auth-service

**Estimated complexity:** Easy

---

#### Task 1.4: Create CustomValidationException
**File:** `src/main/java/com/template/business/exception/CustomValidationException.java`

**Features:**
- Extends BaseException
- Supports field-level validation errors
- Used for @Valid failures and custom validation

**Pattern:** Copy from auth-service

**Estimated complexity:** Easy

---

#### Task 1.5: Create CustomAuthenticationException
**File:** `src/main/java/com/template/business/exception/CustomAuthenticationException.java`

**Features:**
- Extends BaseException
- Used for authentication failures
- Returns 401 Unauthorized

**Pattern:** Copy from auth-service

**Estimated complexity:** Easy

---

#### Task 1.6: Create Additional Custom Exceptions
**Files:**
- `CustomAuthorizationException.java` - For 403 Forbidden
- `InternalDatabaseException.java` - For database errors
- `InternalApiException.java` - For internal errors
- `ExternalServiceException.java` - For external service errors (NEW for business-app)

**Pattern:** Copy from auth-service, add ExternalServiceException for business app

**Estimated complexity:** Easy

---

### Phase 2: Update Existing Exception (1 task)

#### Task 2.1: Update ResourceNotFoundException
**File:** `src/main/java/com/template/business/exception/ResourceNotFoundException.java`

**Current:**
```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

**Update to:**
```java
public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ResourceNotFoundException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }
}
```

**Impact:** Existing usages will need to pass ErrorCode

**Estimated complexity:** Easy

---

### Phase 3: Update GlobalExceptionHandler (1 task)

#### Task 3.1: Enhance GlobalExceptionHandler
**File:** `src/main/java/com/template/business/exception/GlobalExceptionHandler.java`

**Add handlers for:**
- CustomValidationException
- CustomAuthenticationException
- CustomAuthorizationException
- InternalDatabaseException
- InternalApiException
- ExternalServiceException
- Spring Security exceptions (AuthenticationException, AccessDeniedException)
- Database exceptions (DataIntegrityViolationException, LazyInitializationException)
- HTTP protocol exceptions (HttpRequestMethodNotSupportedException, etc.)
- Validation exceptions (MethodArgumentNotValidException - enhance existing)
- Generic fallback (Exception - enhance existing)

**Return type:** Change from `ApiResponse<T>` to `ApiErrorResponse`

**Pattern:** Copy from auth-service GlobalExceptionHandler

**Estimated complexity:** Medium

---

### Phase 4: Fix Service Layer (2 tasks)

#### Task 4.1: Fix AuthService RuntimeExceptions
**File:** `src/main/java/com/template/business/service/AuthService.java`

**Location:** Line 113

**Current:**
```java
throw new RuntimeException("Authentication failed: " + e.getMessage());
```

**Change to:**
```java
throw new CustomAuthenticationException(
    ErrorCode.AUTHENTICATION_ERROR,
    "Authentication failed: " + e.getMessage(),
    e
);
```

**Estimated complexity:** Easy

---

#### Task 4.2: Fix ExternalAuthService RuntimeExceptions
**File:** `src/main/java/com/template/business/service/ExternalAuthService.java`

**Locations:** Lines 67, 71, 76

**Changes:**
1. Line 67: `CustomAuthenticationException(ErrorCode.EXTERNAL_AUTH_ERROR, ...)`
2. Line 71: `CustomAuthenticationException(ErrorCode.EXTERNAL_AUTH_ERROR)`
3. Line 76: `ExternalServiceException(ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE, ...)`

**Estimated complexity:** Easy

---

### Phase 5: Documentation (2 tasks)

#### Task 5.1: Create Exception Handling Documentation
**File:** `business-app-backend/EXCEPTION_HANDLING.md`

**Content:**
- Overview of exception handling system
- Error code reference table
- Custom exception usage examples
- Testing examples
- Client-side integration examples
- Best practices

**Pattern:** Adapt from auth-service EXCEPTION_HANDLING.md

**Estimated complexity:** Medium

---

#### Task 5.2: Create Migration Guide
**File:** `business-app-backend/EXCEPTION_MIGRATION_GUIDE.md`

**Content:**
- What was changed
- Before/after code comparisons
- Benefits of migration
- Testing instructions
- Client impact analysis

**Pattern:** Adapt from auth-service EXCEPTION_MIGRATION_GUIDE.md

**Estimated complexity:** Easy

---

## Task Summary by Phase

| Phase | Tasks | Complexity | Priority |
|-------|-------|------------|----------|
| Phase 1: Create Infrastructure | 6 tasks | Easy-Medium | HIGH |
| Phase 2: Update Existing | 1 task | Easy | MEDIUM |
| Phase 3: Update Handler | 1 task | Medium | HIGH |
| Phase 4: Fix Services | 2 tasks | Easy | HIGH |
| Phase 5: Documentation | 2 tasks | Easy-Medium | MEDIUM |
| **TOTAL** | **12 tasks** | - | - |

---

## Execution Order

### Option A: Sequential (Safest)
1. Phase 1 (Tasks 1.1 → 1.6) - Create all exception classes
2. Phase 3 (Task 3.1) - Update GlobalExceptionHandler
3. Phase 4 (Tasks 4.1 → 4.2) - Fix service layer
4. Phase 2 (Task 2.1) - Update ResourceNotFoundException (may break existing code)
5. Phase 5 (Tasks 5.1 → 5.2) - Documentation

### Option B: Parallel (Faster)
**Batch 1:** Tasks 1.1, 1.2, 1.3 (Core infrastructure)
**Batch 2:** Tasks 1.4, 1.5, 1.6 (Exception subclasses)
**Batch 3:** Tasks 3.1, 4.1, 4.2 (Update handler and services)
**Batch 4:** Tasks 2.1 (Update existing exception - breaking change)
**Batch 5:** Tasks 5.1, 5.2 (Documentation)

### Recommended: Option A (Sequential)
- Safer for incremental testing
- Clear dependencies between phases
- Easier to rollback if issues arise

---

## Breaking Changes

### Task 2.1: ResourceNotFoundException Update
**Impact:** HIGH

**Current usage pattern:**
```java
throw new ResourceNotFoundException("Product not found");
```

**New usage pattern:**
```java
throw new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "Product not found");
```

**Files that may be affected:**
- Any service using `ResourceNotFoundException`
- Check with: `grep -r "new ResourceNotFoundException" src/`

**Mitigation:**
- Keep old constructor as deprecated initially
- Migrate usages gradually
- Or do all at once in Task 2.1

---

## Key Differences from Auth-Service

### 1. New Error Category: External Services (500-599)
Business app may call external services (auth-service, payment APIs, etc.)

**New error codes:**
- `EXTERNAL_AUTH_ERROR` (500) - External auth service failed
- `EXTERNAL_SERVICE_UNAVAILABLE` (501) - External service unavailable
- `EXTERNAL_SERVICE_TIMEOUT` (502) - External service timeout

### 2. New Exception: ExternalServiceException
```java
public class ExternalServiceException extends BaseException {
    public ExternalServiceException(ErrorCode errorCode) {
        super(errorCode);
    }
    // ... other constructors
}
```

### 3. ApiResponse Already Has Timestamp
Business app's `ApiResponse` already includes timestamp - good!
Auth-service uses separate `ApiErrorResponse` for errors.

**Decision needed:**
- Keep both `ApiResponse` (success) and `ApiErrorResponse` (errors)?
- Or unify into single response format?

**Recommendation:** Keep both (follows auth-service pattern)
- `ApiResponse<T>` for successful responses
- `ApiErrorResponse` for error responses

---

## Testing Checklist

After completing all tasks:

- [ ] Test validation errors (field-level)
- [ ] Test authentication errors (401)
- [ ] Test authorization errors (403)
- [ ] Test resource not found (404)
- [ ] Test database constraint violations (409)
- [ ] Test external service errors (500)
- [ ] Test generic exceptions (500)
- [ ] Verify error codes in responses
- [ ] Verify HTTP status codes
- [ ] Test frontend error handling
- [ ] Update API documentation (Swagger)

---

## Estimated Time

| Phase | Time Estimate |
|-------|---------------|
| Phase 1 | 2-3 hours |
| Phase 2 | 30 minutes |
| Phase 3 | 1-2 hours |
| Phase 4 | 30 minutes |
| Phase 5 | 1-2 hours |
| **TOTAL** | **5-8 hours** |

---

## Dependencies

- ✅ No new Maven dependencies needed
- ✅ Uses existing Spring libraries
- ✅ Compatible with current Spring Boot 4.0.1

---

## Rollback Plan

If issues arise:

1. **Rollback Git commits** for specific phases
2. **Revert GlobalExceptionHandler** to original version
3. **Keep new exception classes** (won't break anything if unused)
4. **Restore old ResourceNotFoundException** if needed

---

## Success Criteria

✅ All RuntimeException replaced with custom exceptions
✅ Comprehensive GlobalExceptionHandler with all exception types
✅ Error responses include error codes and types
✅ Field-level validation errors supported
✅ Correct HTTP status codes for all error types
✅ Documentation complete
✅ No compilation errors
✅ Existing functionality preserved
✅ Frontend error handling compatible

---

**Ready to begin?**

We can proceed with:
1. **All at once** - Complete all 12 tasks in sequence
2. **Phase by phase** - Complete one phase, test, then next
3. **Task by task** - Complete one task, review, then next

**Recommended approach:** Phase by phase (5 phases)

Which approach would you prefer?
