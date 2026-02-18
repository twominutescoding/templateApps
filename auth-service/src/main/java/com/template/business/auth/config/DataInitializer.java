package com.template.business.auth.config;

import com.template.business.auth.entity.AppLog;
import com.template.business.auth.entity.ApplicationEntity;
import com.template.business.auth.entity.EntityType;
import com.template.business.auth.entity.LogStatus;
import com.template.business.auth.entity.MailingList;
import com.template.business.auth.entity.MailingListUser;
import com.template.business.auth.entity.Role;
import com.template.business.auth.entity.User;
import com.template.business.auth.entity.UserRole;
import com.template.business.auth.entity.UserStatus;
import com.template.business.auth.repository.AppLogRepository;
import com.template.business.auth.repository.EntityRepository;
import com.template.business.auth.repository.EntityTypeRepository;
import com.template.business.auth.repository.LogStatusRepository;
import com.template.business.auth.repository.MailingListRepository;
import com.template.business.auth.repository.MailingListUserRepository;
import com.template.business.auth.repository.RoleRepository;
import com.template.business.auth.repository.UserRepository;
import com.template.business.auth.repository.UserRoleRepository;
import com.template.business.auth.repository.UserStatusRepository;
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
    private final EntityTypeRepository entityTypeRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserStatusRepository userStatusRepository;
    private final LogStatusRepository logStatusRepository;
    private final AppLogRepository appLogRepository;
    private final MailingListRepository mailingListRepository;
    private final MailingListUserRepository mailingListUserRepository;
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

                // 0. Create Entity Types (lookup table)
                log.info("Creating entity types...");

                EntityType webType = new EntityType();
                webType.setTag("WEB");
                webType.setType("WEB");
                webType.setDescription("Web Application");
                webType.setCreateDate(new Date());
                webType.setCreateUser("system");
                entityTypeRepository.save(webType);

                EntityType mobileType = new EntityType();
                mobileType.setTag("MOB");
                mobileType.setType("MOBILE");
                mobileType.setDescription("Mobile Application");
                mobileType.setCreateDate(new Date());
                mobileType.setCreateUser("system");
                entityTypeRepository.save(mobileType);

                EntityType apiType = new EntityType();
                apiType.setTag("API");
                apiType.setType("API");
                apiType.setDescription("API Service");
                apiType.setCreateDate(new Date());
                apiType.setCreateUser("system");
                entityTypeRepository.save(apiType);

                log.info("Created {} entity types", entityTypeRepository.count());

                // 0.1. Create User Status values (lookup table)
                log.info("Creating user status values...");

                UserStatus activeStatus = new UserStatus();
                activeStatus.setStatus("ACTIVE");
                activeStatus.setDescription("Active user account");
                activeStatus.setCreateDate(new Date());
                activeStatus.setCreateUser("system");
                userStatusRepository.save(activeStatus);

                UserStatus inactiveStatus = new UserStatus();
                inactiveStatus.setStatus("INACTIVE");
                inactiveStatus.setDescription("Inactive user account");
                inactiveStatus.setCreateDate(new Date());
                inactiveStatus.setCreateUser("system");
                userStatusRepository.save(inactiveStatus);

                UserStatus lockedStatus = new UserStatus();
                lockedStatus.setStatus("LOCKED");
                lockedStatus.setDescription("Locked user account");
                lockedStatus.setCreateDate(new Date());
                lockedStatus.setCreateUser("system");
                userStatusRepository.save(lockedStatus);

                log.info("Created {} user status values", userStatusRepository.count());

                // 1. Create Entities (Applications)
                log.info("Creating entities...");

                // Default entity (used when no entityCode specified)
                ApplicationEntity defaultEntity = new ApplicationEntity();
                defaultEntity.setId("DEFAULT");
                defaultEntity.setName("Default Application");
                defaultEntity.setType("WEB");
                defaultEntity.setDescription("Default entity for general access");
                defaultEntity.setCreateDate(new Date());
                defaultEntity.setCreateUser("system");
                entityRepository.save(defaultEntity);

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

                // Auth Service Admin Frontend
                ApplicationEntity authAdmin = new ApplicationEntity();
                authAdmin.setId("TEMP_AUTH_SERVICE");
                authAdmin.setName("TEMP_AUTH_SERVICE");
                authAdmin.setType("WEB");
                authAdmin.setDescription("Authentication Service Administration Panel");
                authAdmin.setCreateDate(new Date());
                authAdmin.setCreateUser("system");
                entityRepository.save(authAdmin);

                log.info("Created {} entities", entityRepository.count());

                // 2. Create Roles
                log.info("Creating roles...");
                // Roles for DEFAULT entity
                Role adminDefault = createRole("ADMIN", "DEFAULT", "1", "Administrator role for DEFAULT");
                Role userDefault = createRole("USER", "DEFAULT", "3", "User role for DEFAULT");

                Role adminApp1 = createRole("ADMIN", "APP001", "1", "Administrator role");
                Role userApp1 = createRole("USER", "APP001", "3", "Regular user role");
                Role managerApp1 = createRole("MANAGER", "APP001", "2", "Manager role");
                Role adminApp2 = createRole("ADMIN", "APP002", "1", "Administrator role for App 2");
                Role userApp2 = createRole("USER", "APP002", "3", "User role for App 2");

                // Roles for AUTH_ADMIN entity
                Role adminAuthAdmin = createRole("ADMIN", "AUTH_ADMIN", "1", "Administrator role for Auth Admin");
                Role userAuthAdmin = createRole("USER", "AUTH_ADMIN", "3", "User role for Auth Admin");

                roleRepository.save(adminDefault);
                roleRepository.save(userDefault);
                roleRepository.save(adminApp1);
                roleRepository.save(userApp1);
                roleRepository.save(managerApp1);
                roleRepository.save(adminApp2);
                roleRepository.save(userApp2);
                roleRepository.save(adminAuthAdmin);
                roleRepository.save(userAuthAdmin);

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
                userRoleRepository.save(createUserRole("admin", "ADMIN", "DEFAULT"));
                userRoleRepository.save(createUserRole("admin", "ADMIN", "APP001"));
                userRoleRepository.save(createUserRole("admin", "ADMIN", "APP002"));
                userRoleRepository.save(createUserRole("admin", "ADMIN", "AUTH_ADMIN"));
                userRoleRepository.save(createUserRole("user1", "USER", "DEFAULT"));
                userRoleRepository.save(createUserRole("user1", "USER", "APP001"));
                userRoleRepository.save(createUserRole("user1", "MANAGER", "APP001"));
                userRoleRepository.save(createUserRole("user2", "USER", "DEFAULT"));
                userRoleRepository.save(createUserRole("user2", "USER", "APP001"));
                userRoleRepository.save(createUserRole("user2", "USER", "APP002"));

                log.info("Created {} user-role assignments", userRoleRepository.count());

                // 5. Create Log Status values (lookup table)
                log.info("Creating log status values...");

                LogStatus infoStatus = createLogStatus("INFO", 7);
                LogStatus warningStatus = createLogStatus("WARNING", 20);
                LogStatus errorStatus = createLogStatus("ERROR", 30);
                LogStatus successStatus = createLogStatus("SUCCESS", 7);

                logStatusRepository.save(infoStatus);
                logStatusRepository.save(warningStatus);
                logStatusRepository.save(errorStatus);
                logStatusRepository.save(successStatus);

                log.info("Created {} log status values", logStatusRepository.count());

                // 6. Create sample application logs
                log.info("Creating sample application logs...");

                Date now = new Date();
                Date fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
                Date tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
                Date oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                Date twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

                appLogRepository.save(createAppLog("APP001", "UserService", "INFO",
                        "{\"action\":\"login\",\"username\":\"admin\"}", "{\"success\":true,\"token\":\"jwt...\"}",
                        twoHoursAgo, new Date(twoHoursAgo.getTime() + 150), "admin", "auth-service"));

                appLogRepository.save(createAppLog("APP001", "OrderService", "SUCCESS",
                        "{\"orderId\":12345,\"items\":[\"item1\",\"item2\"]}", "{\"status\":\"created\",\"orderId\":12345}",
                        oneHourAgo, new Date(oneHourAgo.getTime() + 320), "user1", "order-service"));

                appLogRepository.save(createAppLog("APP002", "ReportGenerator", "WARNING",
                        "{\"reportType\":\"monthly\",\"format\":\"pdf\"}", "{\"status\":\"completed\",\"warnings\":[\"some data missing\"]}",
                        tenMinAgo, new Date(tenMinAgo.getTime() + 5500), "admin", "report-service"));

                appLogRepository.save(createAppLog("APP001", "PaymentGateway", "ERROR",
                        "{\"paymentId\":\"PAY-001\",\"amount\":99.99}", "{\"error\":\"Connection timeout\",\"code\":\"TIMEOUT\"}",
                        fiveMinAgo, new Date(fiveMinAgo.getTime() + 30000), "user2", "payment-service"));

                appLogRepository.save(createAppLog("DEFAULT", "HealthCheck", "SUCCESS",
                        "{\"service\":\"database\"}", "{\"status\":\"healthy\",\"latency\":12}",
                        now, new Date(now.getTime() + 50), null, "monitoring-service"));

                log.info("Created {} sample application logs", appLogRepository.count());

                // 7. Create Mailing Lists
                log.info("Creating mailing lists...");

                MailingList allUsers = createMailingList("ALL_USERS", "All registered users", "ACTIVE");
                MailingList admins = createMailingList("ADMINISTRATORS", "System administrators", "ACTIVE");
                MailingList newsletter = createMailingList("NEWSLETTER", "Newsletter subscribers", "INACTIVE");

                mailingListRepository.save(allUsers);
                mailingListRepository.save(admins);
                mailingListRepository.save(newsletter);

                log.info("Created {} mailing lists", mailingListRepository.count());

                // 8. Create Mailing List User assignments
                log.info("Creating mailing list user assignments...");

                mailingListUserRepository.save(createMailingListUser("ALL_USERS", "admin"));
                mailingListUserRepository.save(createMailingListUser("ALL_USERS", "user1"));
                mailingListUserRepository.save(createMailingListUser("ALL_USERS", "user2"));
                mailingListUserRepository.save(createMailingListUser("ADMINISTRATORS", "admin"));
                mailingListUserRepository.save(createMailingListUser("NEWSLETTER", "user1"));
                mailingListUserRepository.save(createMailingListUser("NEWSLETTER", "user2"));

                log.info("Created {} mailing list user assignments", mailingListUserRepository.count());

                log.info("Data initialization completed successfully!");
                log.info("Sample users created:");
                log.info("  - admin/password (ADMIN in DEFAULT, APP001, APP002 & AUTH_ADMIN)");
                log.info("  - user1/password (USER in DEFAULT, USER & MANAGER in APP001)");
                log.info("  - user2/password (USER in DEFAULT, APP001 & APP002)");

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

    /**
     * Creates a LogStatus entity for the lookup table.
     *
     * @param status the status code (e.g., INFO, WARNING, ERROR)
     * @param deleteAfter number of days to keep logs with this status
     * @return a configured LogStatus entity ready to be persisted
     */
    private LogStatus createLogStatus(String status, Integer deleteAfter) {
        LogStatus logStatus = new LogStatus();
        logStatus.setStatus(status);
        logStatus.setDeleteAfter(deleteAfter);
        logStatus.setCreateDate(new Date());
        logStatus.setCreateUser("system");
        return logStatus;
    }

    /**
     * Creates an AppLog entity for sample data.
     *
     * @param entity the application entity ID
     * @param module the module name
     * @param status the log status
     * @param request the request payload
     * @param response the response payload
     * @param startTime the start time
     * @param endTime the end time
     * @param username the user who performed the action (optional)
     * @param createUser the service that created the log
     * @return a configured AppLog entity ready to be persisted
     */
    private MailingList createMailingList(String name, String description, String status) {
        MailingList ml = new MailingList();
        ml.setName(name);
        ml.setDescription(description);
        ml.setStatus(status);
        ml.setCreateDate(new Date());
        ml.setCreateUser("system");
        return ml;
    }

    private MailingListUser createMailingListUser(String name, String username) {
        MailingListUser mlu = new MailingListUser();
        MailingListUser.MailingListUserId id = new MailingListUser.MailingListUserId();
        id.setName(name);
        id.setUsername(username);
        mlu.setId(id);
        mlu.setCreateDate(new Date());
        mlu.setCreateUser("system");
        return mlu;
    }

    private AppLog createAppLog(String entity, String module, String status,
                                String request, String response,
                                Date startTime, Date endTime,
                                String username, String createUser) {
        AppLog appLog = new AppLog();
        appLog.setEntity(entity);
        appLog.setModule(module);
        appLog.setStatus(status);
        appLog.setRequest(request);
        appLog.setResponse(response);
        appLog.setStartTime(startTime);
        appLog.setEndTime(endTime);
        appLog.setUsername(username);
        appLog.setCreateUser(createUser);
        appLog.setNotifiable("N");
        appLog.setNotificationSent("N");
        appLog.setCreateDate(new Date());
        return appLog;
    }
}
