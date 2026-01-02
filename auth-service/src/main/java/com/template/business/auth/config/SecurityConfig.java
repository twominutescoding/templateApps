package com.template.business.auth.config;

import com.template.business.auth.security.CustomAuthenticationProvider;
import com.template.business.auth.security.JwtAuthenticationFilter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider;
import org.springframework.security.ldap.userdetails.LdapUserDetailsMapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Main security configuration for the authentication service.
 * <p>
 * This configuration class sets up Spring Security for the application, including:
 * <ul>
 *   <li>HTTP security filter chain with stateless session management</li>
 *   <li>CORS configuration</li>
 *   <li>Authorization rules for different endpoints</li>
 *   <li>Optional LDAP/Active Directory authentication</li>
 *   <li>Custom authentication provider integration</li>
 * </ul>
 * </p>
 * <p>
 * The security configuration supports both database-based and LDAP-based authentication.
 * When LDAP is enabled, it configures an Active Directory authentication provider that
 * works in conjunction with the custom authentication provider for fallback scenarios.
 * </p>
 * <p>
 * Public endpoints (no Spring Security authentication, JWT validated in controllers):
 * <ul>
 *   <li>/api/v1/auth/login - Login endpoint</li>
 *   <li>/api/v1/auth/register - Registration endpoint</li>
 *   <li>/api/v1/auth/health - Health check endpoint</li>
 *   <li>/api/v1/auth/refresh - Refresh access token</li>
 *   <li>/api/v1/auth/logout - Logout (revoke refresh token)</li>
 *   <li>/api/v1/auth/logout-all - Logout from all devices</li>
 *   <li>/api/v1/auth/validate - Validate JWT token</li>
 *   <li>/api/v1/auth/sessions/** - Session management endpoints</li>
 *   <li>/api/v1/auth/admin/** - Admin endpoints (JWT validated in controller)</li>
 *   <li>/h2-console/** - H2 database console (development)</li>
 *   <li>/swagger-ui/** - Swagger UI documentation</li>
 *   <li>/v3/api-docs/** - OpenAPI v3 documentation (default SpringDoc path)</li>
 *   <li>/api-docs/** - OpenAPI documentation (custom configured path)</li>
 *   <li>/swagger-resources/** - Swagger resources</li>
 *   <li>/webjars/** - WebJars resources for Swagger UI</li>
 * </ul>
 * </p>
 * <p>
 * Configuration properties:
 * <ul>
 *   <li>{@code ldap.enabled} - Enable/disable LDAP authentication</li>
 *   <li>{@code ldap.url} - LDAP server URL</li>
 *   <li>{@code ldap.base} - LDAP base DN (domain)</li>
 *   <li>{@code ldap.userSearchBase} - Search base for users</li>
 *   <li>{@code ldap.userSearchFilter} - LDAP search filter</li>
 * </ul>
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see CustomAuthenticationProvider
 * @see org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enable @PreAuthorize annotations
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomAuthenticationProvider customAuthenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${ldap.enabled}")
    private boolean ldapEnabled;

    @Value("${ldap.url:ldap://localhost:389}")
    private String ldapUrl;

    @Value("${ldap.base:dc=example,dc=com}")
    private String ldapBase;

    @Value("${ldap.userSearchBase:ou=people}")
    private String userSearchBase;

    @Value("${ldap.userSearchFilter:(&(objectClass=user)(sAMAccountName={1}))}")
    private String userSearchFilter;

    /**
     * Configures the HTTP security filter chain.
     * <p>
     * This method sets up the core security configuration including:
     * <ul>
     *   <li>CSRF protection (disabled for stateless REST API)</li>
     *   <li>CORS configuration</li>
     *   <li>Stateless session management (no server-side sessions)</li>
     *   <li>Authorization rules for endpoints</li>
     *   <li>Frame options (disabled for H2 console)</li>
     * </ul>
     * All endpoints except the explicitly permitted ones require authentication.
     * </p>
     * <p>
     * Note: Session management and admin endpoints are permitted at the Spring Security level
     * but perform JWT validation within the controller methods themselves.
     * </p>
     *
     * @param http the HttpSecurity configuration object
     * @return the configured SecurityFilterChain
     * @throws Exception if an error occurs during configuration
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configure(http))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no authentication required)
                        .requestMatchers("/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/health").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        // SpringDoc OpenAPI / Swagger UI paths
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/api-docs/**").permitAll()
                        .requestMatchers("/swagger-resources/**", "/webjars/**").permitAll()
                        // Public token management endpoints (no auth needed)
                        .requestMatchers("/api/v1/auth/refresh").permitAll()
                        .requestMatchers("/api/v1/auth/logout").permitAll()
                        // Protected endpoints (require JWT authentication via filter)
                        .requestMatchers("/api/v1/auth/logout-all").authenticated()
                        .requestMatchers("/api/v1/auth/validate").authenticated()
                        .requestMatchers("/api/v1/auth/sessions/**").authenticated()
                        .requestMatchers("/api/v1/auth/admin/**").authenticated()
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
                // Add JWT filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configures Active Directory LDAP authentication provider.
     * <p>
     * This bean is conditionally created only when {@code ldap.enabled=true}.
     * It sets up authentication against an Active Directory server with the following features:
     * <ul>
     *   <li>Active Directory domain authentication</li>
     *   <li>Custom search filter for user lookup</li>
     *   <li>Error code to exception conversion</li>
     *   <li>Empty authorities mapping (roles come from database)</li>
     * </ul>
     * The configured provider is injected into the custom authentication provider
     * to enable dual authentication strategy.
     * </p>
     *
     * @return configured Active Directory LDAP authentication provider
     */
    @Bean
    @ConditionalOnProperty(name = "ldap.enabled", havingValue = "true")
    public ActiveDirectoryLdapAuthenticationProvider ldapAuthenticationProvider() {
        log.info("====== Configuring Active Directory LDAP Authentication ======");
        log.info("Domain: {}", ldapBase);
        log.info("URL: {}", ldapUrl);
        log.info("Search Filter: {}", userSearchFilter);
        log.info("================================================================");

        // Simple Active Directory configuration - just like your existing app!
        ActiveDirectoryLdapAuthenticationProvider adProvider =
                new ActiveDirectoryLdapAuthenticationProvider(ldapBase, ldapUrl);

        adProvider.setConvertSubErrorCodesToExceptions(true);
        adProvider.setUseAuthenticationRequestCredentials(true);
        adProvider.setSearchFilter(userSearchFilter);

        // Map LDAP users but ignore LDAP authorities - we get roles from database
        adProvider.setUserDetailsContextMapper(new LdapUserDetailsMapper() {
            @Override
            public UserDetails mapUserFromContext(DirContextOperations ctx, String username,
                                                  Collection<? extends GrantedAuthority> authorities) {
                // Empty authorities list - roles will come from database
                List<GrantedAuthority> emptyAuthorities = new ArrayList<>();
                return super.mapUserFromContext(ctx, username, emptyAuthorities);
            }
        });

        // Inject LDAP provider into custom provider
        customAuthenticationProvider.setLdapAuthenticationProvider(adProvider);

        log.info("Active Directory LDAP Authentication Provider configured successfully");

        return adProvider;
    }

    /**
     * Configures the authentication manager with custom authentication provider.
     * <p>
     * This method registers the custom authentication provider that handles
     * both LDAP and database authentication strategies.
     * </p>
     *
     * @param auth the authentication manager builder
     */
    public void configure(AuthenticationManagerBuilder auth) {
        auth.authenticationProvider(customAuthenticationProvider);
    }
}
