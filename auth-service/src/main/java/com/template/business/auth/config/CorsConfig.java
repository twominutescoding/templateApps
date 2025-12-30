package com.template.business.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS (Cross-Origin Resource Sharing) configuration for the authentication service.
 * <p>
 * This configuration class sets up CORS policies to control which external domains
 * can access the REST API. CORS is a security feature implemented by web browsers
 * to prevent unauthorized cross-origin requests.
 * </p>
 * <p>
 * The configuration is externalized through application properties, allowing
 * different CORS settings for different environments (development, staging, production).
 * </p>
 * <p>
 * Configuration properties:
 * <ul>
 *   <li>{@code cors.allowed-origins} - Comma-separated list of allowed origins (e.g., "http://localhost:3000,https://app.example.com")</li>
 *   <li>{@code cors.allowed-methods} - Comma-separated list of allowed HTTP methods (e.g., "GET,POST,PUT,DELETE")</li>
 *   <li>{@code cors.allowed-headers} - Comma-separated list of allowed headers or "*" for all headers</li>
 *   <li>{@code cors.allow-credentials} - Whether to allow credentials (cookies, authorization headers)</li>
 * </ul>
 * </p>
 * <p>
 * Security considerations:
 * <ul>
 *   <li>In production, specify exact origins instead of using wildcards</li>
 *   <li>Only allow necessary HTTP methods</li>
 *   <li>Be cautious with allow-credentials=true combined with wildcard origins</li>
 *   <li>Regularly review and update allowed origins</li>
 * </ul>
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see org.springframework.web.cors.CorsConfiguration
 * @see org.springframework.web.cors.CorsConfigurationSource
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods}")
    private String allowedMethods;

    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;

    /**
     * Creates and configures the CORS configuration source.
     * <p>
     * This method sets up CORS policies based on application properties and applies
     * them to all endpoints (/**). The configuration includes:
     * <ul>
     *   <li>Allowed origins - domains that can make requests to this API</li>
     *   <li>Allowed methods - HTTP methods permitted for cross-origin requests</li>
     *   <li>Allowed headers - HTTP headers that can be used in requests</li>
     *   <li>Allow credentials - whether cookies and authorization headers are allowed</li>
     *   <li>Max age - how long (in seconds) preflight request results can be cached</li>
     * </ul>
     * The max age is set to 3600 seconds (1 hour) to reduce preflight request overhead.
     * </p>
     *
     * @return configured CorsConfigurationSource for all endpoints
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList(allowedMethods.split(",")));

        if ("*".equals(allowedHeaders)) {
            configuration.addAllowedHeader("*");
        } else {
            configuration.setAllowedHeaders(Arrays.asList(allowedHeaders.split(",")));
        }

        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
