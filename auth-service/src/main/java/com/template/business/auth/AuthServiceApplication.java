package com.template.business.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main entry point for the Authentication Service application.
 *
 * <p>This microservice provides centralized authentication and authorization
 * services supporting both database-based and LDAP/Active Directory authentication.
 *
 * <p>Key features:
 * <ul>
 *   <li>JWT token-based authentication with refresh tokens</li>
 *   <li>Session management and tracking</li>
 *   <li>Active Directory LDAP integration (optional)</li>
 *   <li>Database fallback authentication</li>
 *   <li>Multi-entity role-based authorization</li>
 *   <li>Scheduled token cleanup tasks</li>
 * </ul>
 *
 * @author Template Business
 * @version 1.0
 * @since 2024
 */
@SpringBootApplication
@EnableScheduling
public class AuthServiceApplication {

    /**
     * Main method to start the Spring Boot application.
     *
     * @param args command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
