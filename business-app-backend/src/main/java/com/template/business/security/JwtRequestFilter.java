package com.template.business.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Request Filter for validating tokens from auth-service.
 *
 * This filter validates JWT tokens issued by the external auth-service.
 * It extracts username and roles directly from the token claims,
 * without querying the local database.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                log.error("JWT token extraction failed", e);
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Validate token (signature and expiration)
                if (jwtUtil.isTokenValid(jwt)) {
                    // Extract claims from token (username and roles)
                    Claims claims = jwtUtil.extractAllClaims(jwt);

                    // Extract roles from token claims
                    @SuppressWarnings("unchecked")
                    List<String> roles = claims.get("roles", List.class);

                    // Convert roles to Spring Security authorities (add ROLE_ prefix if needed)
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    // Create authentication token with username, JWT token, and authorities
                    // The JWT token is stored as credentials so it can be used by services
                    // that need to forward it to other services (e.g., AppLogger -> auth-service)
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(username, jwt, authorities);
                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                    log.debug("JWT token validated for user: {} with roles: {}", username, roles);
                }
            } catch (Exception e) {
                log.error("JWT token validation failed for user: {}", username, e);
            }
        }

        chain.doFilter(request, response);
    }
}
