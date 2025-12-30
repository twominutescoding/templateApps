package com.template.business.auth.config;

import com.template.business.auth.entity.ApplicationEntity;
import com.template.business.auth.entity.Role;
import com.template.business.auth.entity.User;
import com.template.business.auth.entity.UserRole;
import com.template.business.auth.repository.EntityRepository;
import com.template.business.auth.repository.RoleRepository;
import com.template.business.auth.repository.UserRepository;
import com.template.business.auth.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Date;

/**
 * Development data initializer for bootstrapping the application with sample data.
 * <p>
 * This configuration class is only active in the 'dev' profile and provides initial
 * data for development and testing purposes. It creates a complete set of sample data
 * including applications, roles, users, and user-role assignments.
 * </p>
 * <p>
 * The initializer creates:
 * <ul>
 *   <li>2 application entities (Main Application, Admin Portal)</li>
 *   <li>5 roles across applications (ADMIN, USER, MANAGER)</li>
 *   <li>3 sample users (admin, user1, user2) with password "password"</li>
 *   <li>6 user-role assignments demonstrating various permission scenarios</li>
 * </ul>
 * </p>
 * <p>
 * Sample users:
 * <ul>
 *   <li>admin/password - ADMIN role in both APP001 and APP002</li>
 *   <li>user1/password - USER and MANAGER roles in APP001</li>
 *   <li>user2/password - USER role in both APP001 and APP002</li>
 * </ul>
 * </p>
 * <p>
 * Note: This initializer only runs when the 'dev' Spring profile is active.
 * It's designed to work with H2 in-memory database which recreates the schema
 * on each application start.
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see org.springframework.boot.CommandLineRunner
 * @see org.springframework.context.annotation.Profile
 */
@Slf4j
@Configuration
@Profile("dev") // Only run in development profile
@RequiredArgsConstructor
public class DataInitializer {

    private final EntityRepository entityRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates and returns a CommandLineRunner that initializes sample data.
     * <p>
     * This method is executed automatically by Spring Boot on application startup
     * when the 'dev' profile is active. It populates the database with sample
     * entities, roles, users, and their relationships for development and testing.
     * </p>
     * <p>
     * The initialization process follows this order:
     * <ol>
     *   <li>Create application entities</li>
     *   <li>Create roles for each application</li>
     *   <li>Create sample users with encoded passwords</li>
     *   <li>Create user-role assignments</li>
     * </ol>
     * </p>
     *
     * @return a CommandLineRunner that performs data initialization
     */
    @Bean
    public CommandLineRunner initializeData() {
        return args -> {
            log.info("Starting data initialization...");

            try {
                // Always initialize for dev environment (H2 recreates on each start with create-drop)
                log.info("Initializing sample data for development environment...");

                // 1. Create Entities (Applications)
                log.info("Creating entities...");
                ApplicationEntity app1 = new ApplicationEntity();
                app1.setId("APP001");
                app1.setName("Main Application");
                app1.setType("WEB");
                app1.setDescription("Main web application");
                app1.setCreateDate(new Date());
                app1.setCreateUser("system");
                entityRepository.save(app1);

                ApplicationEntity app2 = new ApplicationEntity();
                app2.setId("APP002");
                app2.setName("Admin Portal");
                app2.setType("WEB");
                app2.setDescription("Administrative portal");
                app2.setCreateDate(new Date());
                app2.setCreateUser("system");
                entityRepository.save(app2);

                log.info("Created {} entities", entityRepository.count());

                // 2. Create Roles
                log.info("Creating roles...");
                Role adminApp1 = createRole("ADMIN", "APP001", "1", "Administrator role");
                Role userApp1 = createRole("USER", "APP001", "3", "Regular user role");
                Role managerApp1 = createRole("MANAGER", "APP001", "2", "Manager role");
                Role adminApp2 = createRole("ADMIN", "APP002", "1", "Administrator role for App 2");
                Role userApp2 = createRole("USER", "APP002", "3", "User role for App 2");

                roleRepository.save(adminApp1);
                roleRepository.save(userApp1);
                roleRepository.save(managerApp1);
                roleRepository.save(adminApp2);
                roleRepository.save(userApp2);

                log.info("Created {} roles", roleRepository.count());

                // 3. Create Users
                log.info("Creating users...");
                User admin = createUser("admin", "Admin", "User", "admin@example.com", "KONZUM");
                User user1 = createUser("user1", "John", "Doe", "john.doe@example.com", "KONZUM");
                User user2 = createUser("user2", "Jane", "Smith", "jane.smith@example.com", "KONZUM");
                user2.setTheme("light"); // user2 uses light theme

                userRepository.save(admin);
                userRepository.save(user1);
                userRepository.save(user2);

                log.info("Created {} users", userRepository.count());

                // 4. Create User-Role Assignments
                log.info("Creating user-role assignments...");
                userRoleRepository.save(createUserRole("admin", "ADMIN", "APP001"));
                userRoleRepository.save(createUserRole("admin", "ADMIN", "APP002"));
                userRoleRepository.save(createUserRole("user1", "USER", "APP001"));
                userRoleRepository.save(createUserRole("user1", "MANAGER", "APP001"));
                userRoleRepository.save(createUserRole("user2", "USER", "APP001"));
                userRoleRepository.save(createUserRole("user2", "USER", "APP002"));

                log.info("Created {} user-role assignments", userRoleRepository.count());

                log.info("Data initialization completed successfully!");
                log.info("Sample users created:");
                log.info("  - admin/password (ADMIN in APP001 & APP002)");
                log.info("  - user1/password (USER & MANAGER in APP001)");
                log.info("  - user2/password (USER in APP001 & APP002)");

            } catch (Exception e) {
                log.error("Error during data initialization: {}", e.getMessage(), e);
                throw e;
            }
        };
    }

    /**
     * Creates a User entity with encoded password.
     * <p>
     * All created users have the password "password" (BCrypt encoded) and
     * are set to ACTIVE status with dark theme by default.
     * </p>
     *
     * @param username the unique username
     * @param firstName the user's first name
     * @param lastName the user's last name
     * @param email the user's email address
     * @param company the company the user belongs to
     * @return a configured User entity ready to be persisted
     */
    private User createUser(String username, String firstName, String lastName, String email, String company) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("password")); // All users have password "password"
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setCompany(company);
        user.setStatus("ACTIVE");
        user.setCreateDate(new Date());
        user.setCreateUser("system");
        user.setTheme("dark");
        return user;
    }

    /**
     * Creates a Role entity with composite key.
     * <p>
     * Roles are scoped to specific applications (entities) and have
     * role levels to indicate hierarchy (1=highest, 3=lowest).
     * </p>
     *
     * @param role the role name (e.g., ADMIN, USER, MANAGER)
     * @param entity the application entity ID this role belongs to
     * @param roleLevel the hierarchical level of the role (1=highest)
     * @param description human-readable description of the role
     * @return a configured Role entity ready to be persisted
     */
    private Role createRole(String role, String entity, String roleLevel, String description) {
        Role roleEntity = new Role();
        Role.RoleId roleId = new Role.RoleId();
        roleId.setRole(role);
        roleId.setEntity(entity);
        roleEntity.setId(roleId);
        roleEntity.setRoleLevel(roleLevel);
        roleEntity.setDescription(description);
        roleEntity.setCreateDate(new Date());
        roleEntity.setCreateUser("system");
        return roleEntity;
    }

    /**
     * Creates a UserRole entity representing a user-role assignment.
     * <p>
     * User roles are created with ACTIVE status and link users to their
     * roles within specific application contexts.
     * </p>
     *
     * @param username the username to assign the role to
     * @param role the role name to assign
     * @param entity the application entity context for this assignment
     * @return a configured UserRole entity ready to be persisted
     */
    private UserRole createUserRole(String username, String role, String entity) {
        UserRole userRole = new UserRole();
        UserRole.UserRoleId userRoleId = new UserRole.UserRoleId();
        userRoleId.setUsername(username);
        userRoleId.setRole(role);
        userRoleId.setEntity(entity);
        userRole.setId(userRoleId);
        userRole.setStatus("ACTIVE");
        userRole.setCreateDate(new Date());
        userRole.setCreateUser("system");
        return userRole;
    }
}
