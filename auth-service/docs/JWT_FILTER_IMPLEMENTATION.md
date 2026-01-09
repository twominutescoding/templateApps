# JWT Filter Implementation

## Overview

The auth-service has been refactored to use **proper Spring Security patterns** with a JWT authentication filter. This eliminates code duplication, improves security, and enables role-based access control using `@PreAuthorize` annotations.

---

## What Changed

### Before (Controller-based JWT validation)

**Problems:**
- ❌ Manual JWT validation in every controller method
- ❌ Code duplication across endpoints
- ❌ Easy to forget validation for new endpoints
- ❌ No role-based access control
- ❌ Not following Spring Security best practices

**Example:**
```java
@GetMapping("/admin/sessions")
public ResponseEntity<?> getAllSessions(@RequestHeader("Authorization") String authHeader) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        if (username != null) {
            // Do work...
        }
    }
    return unauthorized();
}
```

### After (JWT Filter-based)

**Benefits:**
- ✅ Centralized JWT validation in one filter
- ✅ No code duplication
- ✅ Automatic authentication for all endpoints
- ✅ Role-based access control with `@PreAuthorize`
- ✅ Clean controller code
- ✅ Follows Spring Security best practices

**Example:**
```java
@GetMapping("/admin/sessions")
@PreAuthorize("hasRole('ADMIN')")  // Declarative security!
public ResponseEntity<?> getAllSessions() {
    String username = SecurityContextHolder.getContext()
                        .getAuthentication().getName();
    // Do work...
}
```

---

## Architecture

### Request Flow

```
1. HTTP Request
   ↓
2. JwtAuthenticationFilter (validates JWT)
   ↓
3. Extract username from token
   ↓
4. Load UserDetails from database (with roles)
   ↓
5. Set SecurityContext with authenticated user
   ↓
6. Spring Security checks @PreAuthorize annotations
   ↓
7. Controller method (clean, no auth code)
   ↓
8. Response
```

### Components

#### 1. JwtAuthenticationFilter

**File:** `security/JwtAuthenticationFilter.java`

**Responsibilities:**
- Intercepts ALL HTTP requests
- Extracts JWT from `Authorization: Bearer <token>` header
- Validates token signature and expiration
- Loads user details from database (including roles)
- Sets Spring Security context
- Skips public endpoints (login, register, etc.)

**Key Methods:**
```java
@Override
protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain) {

    // Extract Authorization header
    String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        filterChain.doFilter(request, response);
        return;
    }

    // Extract and validate JWT
    String jwt = authHeader.substring(7);
    String username = jwtUtil.extractUsername(jwt);

    if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        // Load user from database
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // Validate token
        if (jwtUtil.validateToken(jwt, userDetails)) {
            // Create authentication object
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities() // ROLES!
                );

            // Set in SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }

    filterChain.doFilter(request, response);
}
```

**Endpoints Skipped (Public):**
- `/auth/api/v1/auth/login`
- `/auth/api/v1/auth/register`
- `/auth/api/v1/auth/health`
- `/auth/api/v1/auth/refresh`
- `/auth/api/v1/auth/logout`
- `/auth/h2-console/**`
- `/auth/swagger-ui/**`
- Swagger/OpenAPI endpoints

#### 2. SecurityConfig Updates

**File:** `config/SecurityConfig.java`

**Changes:**
1. Added `@EnableMethodSecurity(prePostEnabled = true)` - Enables `@PreAuthorize`
2. Injected `JwtAuthenticationFilter`
3. Added filter to chain: `.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`
4. Changed protected endpoints from `.permitAll()` to `.authenticated()`

**Before:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // No filter, endpoints set to permitAll()
}
```

**After:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // ← NEW!
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;  // ← NEW!

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/login", "...").permitAll()
                .requestMatchers("/api/v1/auth/admin/**").authenticated()  // ← Changed!
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);  // ← NEW!

        return http.build();
    }
}
```

#### 3. Controller Refactoring

**File:** `controller/AuthController.java`

**Changes:**
- Removed all `@RequestHeader("Authorization")` parameters
- Removed manual JWT extraction and validation
- Added `@PreAuthorize` annotations for admin endpoints
- Use `SecurityContextHolder.getContext().getAuthentication()` to get current user

**Before:**
```java
@GetMapping("/admin/sessions")
public ResponseEntity<?> getAllSessions(@RequestHeader("Authorization") String authHeader) {
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        if (username != null) {
            // TODO: Check if user has ADMIN role
            List<SessionDTO> sessions = refreshTokenService.getAllActiveSessions();
            return ResponseEntity.ok(sessions);
        }
    }
    return ResponseEntity.status(401).body("Unauthorized");
}
```

**After:**
```java
@GetMapping("/admin/sessions")
@PreAuthorize("hasRole('ADMIN')")  // ← Role check!
public ResponseEntity<?> getAllSessions() {
    // Get user from SecurityContext (set by filter)
    String username = SecurityContextHolder.getContext().getAuthentication().getName();

    List<SessionDTO> sessions = refreshTokenService.getAllActiveSessions();
    return ResponseEntity.ok(sessions);
}
```

---

## Role-Based Access Control

### How It Works

1. **JWT Filter** loads user from database with roles:
   ```java
   UserDetails userDetails = userDetailsService.loadUserByUsername(username);
   // userDetails.getAuthorities() contains roles like "ADMIN", "USER"
   ```

2. **@PreAuthorize** annotation checks roles:
   ```java
   @PreAuthorize("hasRole('ADMIN')")  // Only users with ADMIN role
   @PreAuthorize("hasRole('USER')")   // Only users with USER role
   @PreAuthorize("hasAnyRole('ADMIN', 'USER')")  // Either role
   ```

3. **Spring Security** automatically returns **403 Forbidden** if role check fails

### Admin Endpoints

All admin endpoints now require ADMIN role:

```java
// Get all sessions (all users)
@GetMapping("/admin/sessions")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<List<SessionDTO>>> getAllSessions() { ... }

// Revoke any user's session
@PostMapping("/admin/sessions/revoke")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<String>> revokeSessionByAdmin(...) { ... }

// Force logout any user
@PostMapping("/admin/users/{username}/logout")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<String>> forceLogoutUser(...) { ... }
```

### User Endpoints

Regular endpoints require authentication but no specific role:

```java
// Get own sessions (any authenticated user)
@GetMapping("/sessions")
public ResponseEntity<ApiResponse<List<SessionDTO>>> getSessions(...) { ... }

// Logout from all devices (any authenticated user)
@PostMapping("/logout-all")
public ResponseEntity<ApiResponse<String>> logoutAll() { ... }

// Revoke own session (any authenticated user)
@PostMapping("/sessions/revoke")
public ResponseEntity<ApiResponse<String>> revokeSession(...) { ... }
```

---

## How Roles Are Loaded

### DatabaseUserDetailsService

**File:** `service/DatabaseUserDetailsService.java`

The `loadUserByUsername` method loads roles from the database:

```java
@Override
public UserDetails loadUserByUsername(String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    // Load roles from D_USER_ROLES table
    Set<GrantedAuthority> authorities = user.getUserRoles().stream()
        .filter(ur -> "ACTIVE".equals(ur.getStatus()))
        .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getId().getRole()))
        .collect(Collectors.toSet());

    return new org.springframework.security.core.userdetails.User(
        user.getUsername(),
        user.getPassword(),
        authorities  // ← Roles loaded here!
    );
}
```

**Important:** Spring Security expects role names to start with `ROLE_` prefix:
- Database: `ADMIN` → Authority: `ROLE_ADMIN`
- Database: `USER` → Authority: `ROLE_USER`

When using `@PreAuthorize("hasRole('ADMIN')")`, Spring automatically adds the `ROLE_` prefix.

---

## Testing

### 1. Test Login (Get JWT Token)

```bash
curl -X POST http://localhost:8091/auth/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password",
    "entityCode": "APP001"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "550e8400-...",
    "username": "admin",
    "roles": ["ADMIN"],
    ...
  }
}
```

### 2. Test Protected Endpoint (With ADMIN Role)

```bash
# Should work - admin user has ADMIN role
curl -X GET "http://localhost:8091/auth/api/v1/auth/admin/sessions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**Response:** 200 OK with session list

### 3. Test Protected Endpoint (Without ADMIN Role)

```bash
# Login as regular user
TOKEN=$(curl -s -X POST http://localhost:8091/auth/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password","entityCode":"APP001"}' \
  | jq -r '.data.token')

# Try to access admin endpoint
curl -X GET "http://localhost:8091/auth/api/v1/auth/admin/sessions" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** 403 Forbidden (automatically handled by Spring Security)

### 4. Test Regular Endpoint (Any Authenticated User)

```bash
# Should work for any authenticated user
curl -X GET "http://localhost:8091/auth/api/v1/auth/sessions" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** 200 OK with user's own sessions

### 5. Test Invalid Token

```bash
curl -X GET "http://localhost:8091/auth/api/v1/auth/sessions" \
  -H "Authorization: Bearer invalid_token"
```

**Response:** 401 Unauthorized

### 6. Test No Token

```bash
curl -X GET "http://localhost:8091/auth/api/v1/auth/sessions"
```

**Response:** 401 Unauthorized

---

## SecurityContext Usage in Controllers

### Get Current User

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
String username = authentication.getName();
```

### Get User Roles

```java
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
boolean isAdmin = authorities.stream()
    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
```

### Get Full UserDetails

```java
if (authentication.getPrincipal() instanceof UserDetails) {
    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    String username = userDetails.getUsername();
    Collection<? extends GrantedAuthority> roles = userDetails.getAuthorities();
}
```

---

## Error Handling

### 401 Unauthorized

**When:** No JWT token or invalid token

**Response:**
```json
{
  "timestamp": "2026-01-02T14:30:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Unauthorized",
  "path": "/auth/api/v1/auth/sessions"
}
```

### 403 Forbidden

**When:** Valid JWT but missing required role

**Response:**
```json
{
  "timestamp": "2026-01-02T14:30:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/auth/api/v1/auth/admin/sessions"
}
```

---

## Benefits Summary

### Before vs After

| Aspect | Before (Controller-based) | After (Filter-based) |
|--------|--------------------------|---------------------|
| **JWT Validation** | Manual in each method | Automatic in filter |
| **Code Duplication** | High | None |
| **Role Checking** | Manual | `@PreAuthorize` |
| **Security Risk** | Easy to forget | Centralized |
| **Controller Code** | Complex | Clean |
| **Maintainability** | Difficult | Easy |
| **Spring Security Pattern** | ❌ Not standard | ✅ Best practice |

### Clean Code Example

**Before:**
```java
@GetMapping("/sessions")
public ResponseEntity<ApiResponse<List<SessionDTO>>> getSessions(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam(required = false) String refreshToken) {
    try {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            if (username != null) {
                List<SessionDTO> sessions = refreshTokenService.getActiveSessions(username, refreshToken);
                return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", sessions));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid token"));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Failed"));
    }
}
```

**After:**
```java
@GetMapping("/sessions")
public ResponseEntity<ApiResponse<List<SessionDTO>>> getSessions(
        @RequestParam(required = false) String refreshToken) {
    try {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<SessionDTO> sessions = refreshTokenService.getActiveSessions(username, refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", sessions));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Failed"));
    }
}
```

**Lines of code:** 22 → 11 (50% reduction!)

---

## Migration Guide

If you have other services using the auth-service, no changes needed on the client side:

1. ✅ **Same API** - Endpoints haven't changed
2. ✅ **Same headers** - Still use `Authorization: Bearer <token>`
3. ✅ **Same responses** - Response format unchanged
4. ✅ **Same tokens** - JWT format unchanged

The changes are **internal** to the auth-service only.

---

## Future Enhancements

### Custom Access Control

You can create custom expressions:

```java
@PreAuthorize("@securityService.canAccessUser(#username)")
public ResponseEntity<?> getUserData(@PathVariable String username) { ... }
```

### Method-level Security

```java
@Service
public class UserService {

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String username) { ... }

    @PreAuthorize("#username == authentication.name or hasRole('ADMIN')")
    public User getUser(String username) { ... }
}
```

### Custom Authentication

```java
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(...) {
        // Custom 401 response
    }
}
```

---

## Troubleshooting

### Issue: 403 Forbidden for Admin Endpoint

**Possible Causes:**
1. User doesn't have ADMIN role in database
2. Role name mismatch (check D_USER_ROLES table)
3. User has role in different entity

**Check:**
```sql
SELECT ur.username, ur.role, ur.entity, ur.status
FROM D_USER_ROLES ur
WHERE ur.username = 'admin'
  AND ur.status = 'ACTIVE';
```

**Expected:** Should see `ADMIN` role with ACTIVE status

### Issue: Filter Not Running

**Check:**
1. Is `@EnableMethodSecurity` present in SecurityConfig?
2. Is filter injected in SecurityConfig constructor?
3. Is filter added to chain with `.addFilterBefore(...)`?

**Debug:**
Add logging in `JwtAuthenticationFilter.doFilterInternal()`:
```java
log.info("JWT Filter processing request: {}", request.getRequestURI());
```

### Issue: Roles Not Loading

**Check:**
1. `DatabaseUserDetailsService.loadUserByUsername()` loads roles
2. Roles have `ROLE_` prefix: `new SimpleGrantedAuthority("ROLE_" + roleName)`
3. User roles are ACTIVE in database

---

## Conclusion

The JWT filter implementation follows **Spring Security best practices** and provides:

✅ **Centralized authentication** - One place to validate JWTs
✅ **Clean controllers** - No authentication code duplication
✅ **Role-based access** - Declarative `@PreAuthorize` annotations
✅ **Better security** - Harder to forget authentication
✅ **Maintainable** - Easy to understand and modify
✅ **Production-ready** - Standard enterprise pattern

**This is how professional Spring Boot applications handle JWT authentication!**

---

**Version:** 1.0
**Last Updated:** 2026-01-02
**Author:** Auth Service Team
