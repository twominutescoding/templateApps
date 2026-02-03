package com.template.business.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA Auditing configuration that provides the current user for @CreatedBy and @LastModifiedBy.
 * Extracts the username from the Spring Security context (JWT token).
 */
@Configuration
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.of("SYSTEM");
            }

            // Get username from authentication principal
            String username = authentication.getName();

            // Handle anonymous users
            if ("anonymousUser".equals(username)) {
                return Optional.of("SYSTEM");
            }

            return Optional.of(username);
        };
    }
}
