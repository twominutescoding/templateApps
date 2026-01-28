package com.template.business.exception;

import lombok.Getter;

/**
 * Enumeration of error codes used throughout the application.
 *
 * <p>Each error code has a unique numeric code and a default message.
 * These codes are used in {@link ApiErrorResponse} to provide consistent
 * error responses to clients.
 *
 * @author Template Business
 * @version 1.0
 */
@Getter
public enum ErrorCode {

    // General errors (000-099)
    INTERNAL_SERVER_ERROR("000", "An unexpected error occurred."),
    VALIDATION_ERROR("003", "Validation failed for one or more fields."),
    INVALID_ARGUMENT("005", "The provided argument is invalid."),
    METHOD_NOT_ALLOWED("006", "The HTTP method is not supported for this endpoint."),
    UNSUPPORTED_MEDIA_TYPE("007", "The provided content type is not supported."),
    MALFORMED_REQUEST("008", "The request body is missing or malformed."),
    MISSING_PARAMETER("009", "A required request parameter is missing."),

    // Authentication errors (100-199)
    AUTHENTICATION_ERROR("100", "Authentication failed. Please check your credentials."),
    INVALID_CREDENTIALS("101", "Invalid username or password."),
    INVALID_TOKEN("102", "The provided token is invalid or expired."),
    TOKEN_EXPIRED("103", "The authentication token has expired."),
    ACCOUNT_DISABLED("104", "This account has been disabled."),
    ACCOUNT_LOCKED("105", "This account has been locked."),
    INVALID_REFRESH_TOKEN("106", "The refresh token is invalid or expired."),

    // Authorization errors (200-299)
    ACCESS_DENIED("200", "You do not have permission to perform this action."),
    INSUFFICIENT_PERMISSIONS("201", "Insufficient permissions to access this resource."),
    UNAUTHORIZED_SESSION_ACCESS("202", "You can only manage your own sessions."),

    // Resource errors (300-399)
    ENTITY_NOT_FOUND("300", "The requested entity was not found."),
    USER_NOT_FOUND("301", "User not found."),
    ROLE_NOT_FOUND("302", "Role not found."),
    SESSION_NOT_FOUND("303", "Session not found."),
    USER_ALREADY_EXISTS("304", "A user with this username already exists."),
    RESOURCE_ALREADY_EXISTS("305", "The resource already exists."),

    // Database errors (400-499)
    DATA_INTEGRITY_ERROR("400", "A database constraint was violated."),
    INTERNAL_DATABASE_ERROR("401", "Internal database error."),
    LAZY_INITIALIZATION_ERROR("402", "Failed to load related data from database."),

    // External Service / LDAP errors (500-599)
    LDAP_CONNECTION_ERROR("500", "Failed to connect to LDAP server."),
    LDAP_AUTHENTICATION_ERROR("501", "LDAP authentication failed."),
    EXTERNAL_AUTH_ERROR("502", "External authentication service failed."),
    EXTERNAL_SERVICE_UNAVAILABLE("503", "External service is unavailable."),
    EXTERNAL_SERVICE_TIMEOUT("504", "External service request timed out."),

    // Session / Business Logic errors (600-699)
    SESSION_LIMIT_EXCEEDED("600", "Maximum number of concurrent sessions exceeded."),
    SESSION_EXPIRED("601", "Session has expired."),
    SESSION_REVOKED("602", "Session has been revoked."),
    BUSINESS_RULE_VIOLATION("603", "Business rule validation failed."),
    INVALID_OPERATION("604", "The requested operation is not valid in the current state."),
    DUPLICATE_ENTRY("605", "Duplicate entry detected.");

    private final String code;
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
