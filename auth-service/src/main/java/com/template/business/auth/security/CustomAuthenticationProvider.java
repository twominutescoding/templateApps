package com.template.business.auth.security;

import com.template.business.auth.service.DatabaseUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Custom authentication provider supporting dual authentication strategy.
 * <p>
 * This provider implements a fallback authentication mechanism that attempts
 * LDAP authentication first (if enabled), then falls back to database authentication
 * if LDAP fails or is disabled. This allows the application to support both
 * LDAP-based enterprise authentication and local database authentication.
 * </p>
 * <p>
 * Authentication flow:
 * <ol>
 *   <li>If LDAP is enabled, attempt LDAP authentication</li>
 *   <li>If LDAP succeeds, return authenticated token</li>
 *   <li>If LDAP fails or is disabled, attempt database authentication</li>
 *   <li>If database authentication succeeds, return authenticated token</li>
 *   <li>If both methods fail, throw BadCredentialsException</li>
 * </ol>
 * </p>
 * <p>
 * Configuration properties:
 * <ul>
 *   <li>{@code ldap.enabled} - Enables or disables LDAP authentication</li>
 * </ul>
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see org.springframework.security.authentication.AuthenticationProvider
 * @see DatabaseUserDetailsService
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CustomAuthenticationProvider implements AuthenticationProvider {

    private final DatabaseUserDetailsService databaseUserDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Value("${ldap.enabled}")
    private boolean ldapEnabled;

    private AuthenticationProvider ldapAuthenticationProvider;

    /**
     * Authenticates a user using dual strategy (LDAP then database).
     * <p>
     * This method attempts to authenticate the user first via LDAP (if enabled),
     * then falls back to database authentication. It logs the authentication
     * attempts at various levels for debugging and auditing purposes.
     * </p>
     *
     * @param authentication the authentication request object containing username and password
     * @return a fully authenticated object including credentials and authorities
     * @throws AuthenticationException if authentication fails with both LDAP and database
     */
    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getName();
        String password = authentication.getCredentials().toString();

        log.debug("Attempting authentication for user: {}", username);

        // Try LDAP first if enabled
        if (ldapEnabled) {
            try {
                log.debug("Attempting LDAP authentication for user: {}", username);
                Authentication ldapAuth = authenticateWithLdap(username, password);
                if (ldapAuth != null && ldapAuth.isAuthenticated()) {
                    log.info("User {} authenticated successfully via LDAP", username);
                    return ldapAuth;
                }
            } catch (Exception e) {
                log.debug("LDAP authentication failed for user {}: {}", username, e.getMessage());
            }
        }

        // Fallback to database authentication
        try {
            log.debug("Attempting database authentication for user: {}", username);
            Authentication dbAuth = authenticateWithDatabase(username, password);
            if (dbAuth != null && dbAuth.isAuthenticated()) {
                log.info("User {} authenticated successfully via DATABASE", username);
                return dbAuth;
            }
        } catch (Exception e) {
            log.debug("Database authentication failed for user {}: {}", username, e.getMessage());
        }

        // Both methods failed
        log.warn("Authentication failed for user {}: credentials invalid in both LDAP and database", username);
        throw new BadCredentialsException("Invalid username or password");
    }

    /**
     * Attempts authentication against LDAP server.
     * <p>
     * This method delegates authentication to the configured LDAP authentication
     * provider. It catches all exceptions and returns null if LDAP authentication
     * fails, allowing fallback to database authentication.
     * </p>
     *
     * @param username the username to authenticate
     * @param password the password to verify
     * @return authenticated Authentication object if successful, null otherwise
     */
    private Authentication authenticateWithLdap(String username, String password) {
        if (ldapAuthenticationProvider == null) {
            return null; // LDAP not configured
        }

        try {
            UsernamePasswordAuthenticationToken authRequest =
                new UsernamePasswordAuthenticationToken(username, password);
            return ldapAuthenticationProvider.authenticate(authRequest);
        } catch (Exception e) {
            log.debug("LDAP authentication error: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Attempts authentication against the database.
     * <p>
     * This method loads the user from the database, verifies the password using
     * the configured password encoder, and returns an authenticated token if
     * credentials are valid.
     * </p>
     *
     * @param username the username to authenticate
     * @param password the password to verify
     * @return authenticated Authentication object with user details and authorities
     * @throws BadCredentialsException if user is not found or password is invalid
     */
    private Authentication authenticateWithDatabase(String username, String password) {
        UserDetails userDetails = databaseUserDetailsService.loadUserByUsername(username);

        if (userDetails == null) {
            throw new BadCredentialsException("User not found in database");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        return new UsernamePasswordAuthenticationToken(
            userDetails,
            password,
            userDetails.getAuthorities()
        );
    }

    /**
     * Sets the LDAP authentication provider.
     * <p>
     * This method allows injection of the LDAP authentication provider,
     * which is conditionally created based on the ldap.enabled property.
     * </p>
     *
     * @param ldapAuthenticationProvider the LDAP authentication provider to use
     */
    public void setLdapAuthenticationProvider(AuthenticationProvider ldapAuthenticationProvider) {
        this.ldapAuthenticationProvider = ldapAuthenticationProvider;
    }

    /**
     * Indicates whether this provider supports the given authentication type.
     * <p>
     * This provider supports UsernamePasswordAuthenticationToken and its subclasses.
     * </p>
     *
     * @param authentication the authentication class to check
     * @return true if this provider supports the authentication type, false otherwise
     */
    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
