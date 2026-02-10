package com.template.business.config;

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

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @Value("${server.port:8090}")
    private String serverPort;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Business App API")
                        .version("1.0.0")
                        .description("""
                            Business application backend API.

                            ## Architecture
                            This application uses **external auth-service** for authentication:
                            - All user authentication is handled by a separate auth-service microservice
                            - JWT tokens are issued by auth-service and validated locally
                            - Refresh tokens are managed by auth-service (7-day expiration)
                            - No local user database (users stored in auth-service)

                            ## Authentication
                            1. Call `/auth/login` with username, password, and entityCode
                            2. Use the returned `token` in the Authorization header: `Bearer <token>`
                            3. When token expires, call `/auth/refresh` with the refresh token

                            ## Authorization
                            Endpoints are protected by role-based access control:
                            - **ADMIN**: Administrative operations
                            - **USER**: Standard user operations
                            - **MANAGER**: Management operations
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
                                .description("JWT access token obtained from /auth/login")));
    }
}
