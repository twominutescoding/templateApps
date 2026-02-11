package com.template.business.auth.security;

import com.template.business.auth.service.DatabaseUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT Authentication Filter for validating JWT tokens on incoming requests.
 *
 * <p>This filter intercepts all HTTP requests and validates the JWT token from the
 * Authorization header. If a valid token is found, it sets the authentication in the
 * Spring Security context, making the user details available to controllers.
 *
 * <p>Filter execution flow:
 * <ol>
 *   <li>Extract JWT token from Authorization header (Bearer token)</li>
 *   <li>Validate token signature and expiration</li>
 *   <li>Extract username from token claims</li>
 *   <li>Load user details from database (including roles)</li>
 *   <li>Create Authentication object and set in SecurityContext</li>
 *   <li>Continue filter chain</li>
 * </ol>
 *
 * <p>If no token is present or token is invalid, the filter chain continues
 * without setting authentication. Spring Security will handle authorization
 * based on endpoint configuration.
 *
 * @author Template Business
 * @version 1.0
 * @see JwtUtil
 * @see DatabaseUserDetailsService
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final DatabaseUserDetailsService userDetailsService;

    @Value("${app.logging.entity-name}")
    private String configuredEntityName;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, DatabaseUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Filter method that processes each request to validate JWT tokens.
     *
     * <p>This method is called once per request. It extracts and validates the JWT token,
     * then sets the authentication in the SecurityContext if the token is valid.
     *
     * @param request the HTTP request
     * @param response the HTTP response
     * @param filterChain the filter chain to continue processing
     * @throws ServletException if a servlet error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Extract Authorization header
        final String authHeader = request.getHeader("Authorization");

        // If no Authorization header or doesn't start with "Bearer ", skip JWT processing
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Extract JWT token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            log.debug("JWT Filter: Processing request to: {}", request.getRequestURI());

            // Extract username from token
            final String username = jwtUtil.extractUsername(jwt);
            log.debug("JWT Filter: Extracted username: {}", username);

            // If username is present and user is not already authenticated
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Load user details from database (includes roles)
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                log.debug("JWT Filter: Loaded user details for: {}, authorities: {}",
                        username, userDetails.getAuthorities());

                // Validate token against user details
                if (jwtUtil.validateToken(jwt, userDetails)) {

                    // Validate entity name - but only for entity-specific endpoints (admin endpoints)
                    // Entity-agnostic endpoints (user's own operations) can be accessed with any valid token
                    String tokenEntityName = jwtUtil.extractEntityName(jwt);
                    if (tokenEntityName != null && !tokenEntityName.equals(configuredEntityName)) {
                        // Check if this is an entity-specific endpoint that requires matching entity
                        if (isEntitySpecificEndpoint(request.getRequestURI())) {
                            log.warn("JWT Filter: Token entity '{}' does not match configured entity '{}' for admin endpoint",
                                    tokenEntityName, configuredEntityName);
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\":false,\"message\":\"Token not valid for this application. Admin endpoints require auth-service token.\"}");
                            return;
                        }
                        // For entity-agnostic endpoints, allow the request to proceed
                        log.debug("JWT Filter: Token entity '{}' differs from configured '{}', but endpoint is entity-agnostic",
                                tokenEntityName, configuredEntityName);
                    }

                    // Create authentication token with user details and authorities
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // credentials (password) not needed after authentication
                            userDetails.getAuthorities() // roles/permissions
                    );

                    // Set additional details (IP address, session info, etc.)
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in SecurityContext
                    // Now Spring Security knows this user is authenticated
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("JWT Filter: Successfully authenticated user: {} with roles: {}",
                            username, userDetails.getAuthorities());
                } else {
                    log.warn("JWT Filter: Token validation failed for user: {}", username);
                }
            } else if (username == null) {
                log.warn("JWT Filter: Could not extract username from token");
            } else {
                log.debug("JWT Filter: User already authenticated: {}",
                        SecurityContextHolder.getContext().getAuthentication().getName());
            }
        } catch (Exception e) {
            // Log the error but don't fail the request
            // Let Spring Security handle authorization based on endpoint config
            log.error("JWT authentication failed: {}", e.getMessage(), e);
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Determine if this filter should be applied to the current request.
     *
     * <p>This method can be overridden to skip JWT validation for certain endpoints.
     * For example, you might skip public endpoints like /login, /register.
     *
     * @param request the HTTP request
     * @return true if filter should NOT be applied, false to apply filter
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip JWT validation for these public endpoints
        // Note: getRequestURI() includes the context path (/auth), so paths here
        // must include it. SecurityConfig uses paths without context path.
        return path.equals("/auth/api/v1/auth/login") ||
               path.equals("/auth/api/v1/auth/register") ||
               path.equals("/auth/api/v1/auth/health") ||
               path.equals("/auth/api/v1/auth/refresh") ||
               path.equals("/auth/api/v1/auth/logout") ||
               path.startsWith("/auth/h2-console") ||
               path.startsWith("/auth/swagger-ui") ||
               path.startsWith("/auth/v3/api-docs") ||
               path.startsWith("/auth/api-docs") ||
               path.startsWith("/auth/swagger-resources") ||
               path.startsWith("/auth/webjars");
    }

    /**
     * Determine if the endpoint requires entity-specific token validation.
     *
     * <p>Entity-specific endpoints are admin operations that should only be accessible
     * from the auth-service admin panel (requires token issued for auth-service entity).
     *
     * <p>Entity-agnostic endpoints are user-facing operations that can be accessed
     * from any application with a valid token (theme updates, user's own sessions, etc.)
     *
     * @param path the request URI path
     * @return true if endpoint requires matching entity token, false if any valid token works
     */
    private boolean isEntitySpecificEndpoint(String path) {
        // Admin endpoints - require auth-service entity token
        // These are administrative operations that should only be accessible from auth-service admin panel

        // Admin session management
        if (path.startsWith("/auth/api/v1/auth/admin/")) {
            return true;
        }

        // Admin user/role/entity management
        if (path.startsWith("/auth/api/v1/admin/")) {
            return true;
        }

        // All other endpoints are entity-agnostic:
        // - PUT /auth/api/v1/auth/theme - User updates their own theme
        // - GET /auth/api/v1/auth/sessions - User views their own sessions
        // - POST /auth/api/v1/auth/sessions/revoke - User revokes their own session
        // - POST /auth/api/v1/auth/logout-all - User logs out from all devices
        // - GET /auth/api/v1/auth/validate - Token validation
        // - POST /auth/api/v1/logs - Any app can write logs
        return false;
    }
}
