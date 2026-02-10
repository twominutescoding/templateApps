package com.template.business.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration for API documentation.
 *
 * <p>Configures:
 * <ul>
 *   <li>API metadata (title, version, description)</li>
 *   <li>JWT Bearer authentication scheme</li>
 *   <li>Server URLs</li>
 * </ul>
 *
 * @author Template Business
 * @version 1.0
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.servlet.context-path:/auth}")
    private String contextPath;

    @Value("${server.port:8091}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Auth Service API")
                        .version("1.0.0")
                        .description("""
                            Centralized authentication and authorization service.

                            ## Features
                            - **JWT Authentication**: Access tokens (15 min) and refresh tokens (7 days)
                            - **Dual Authentication**: LDAP (Active Directory) with database fallback
                            - **Multi-Entity Support**: Role-based access control per application/entity
                            - **Session Management**: View and revoke active sessions
                            - **Centralized Logging**: Log aggregation for backend services

                            ## Authentication
                            1. Call `/api/v1/auth/login` with username, password, and entityCode
                            2. Use the returned `token` in the Authorization header: `Bearer <token>`
                            3. When token expires, call `/api/v1/auth/refresh` with the refresh token

                            ## Roles
                            - **ADMIN**: Full access to all endpoints
                            - **USER**: Basic authenticated access
                            - Custom roles can be created per entity
                            """)
                        .contact(new Contact()
                                .name("Template Business")
                                .email("support@template.business"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://template.business/license")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort + contextPath)
                                .description("Local Development Server")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token obtained from /api/v1/auth/login")));
    }
}
