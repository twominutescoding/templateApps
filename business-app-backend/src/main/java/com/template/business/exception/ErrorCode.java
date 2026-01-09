package com.template.business.exception;

import lombok.Getter;

/**
 * Enumeration of error codes used throughout the business application.
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

    // Resource errors (300-399)
    ENTITY_NOT_FOUND("300", "The requested entity was not found."),
    USER_NOT_FOUND("301", "User not found."),
    PRODUCT_NOT_FOUND("302", "Product not found."),
    RESOURCE_ALREADY_EXISTS("304", "The resource already exists."),

    // Database errors (400-499)
    DATA_INTEGRITY_ERROR("400", "A database constraint was violated."),
    INTERNAL_DATABASE_ERROR("401", "Internal database error."),
    LAZY_INITIALIZATION_ERROR("402", "Failed to load related data from database."),

    // External Service errors (500-599)
    EXTERNAL_AUTH_ERROR("500", "External authentication service failed."),
    EXTERNAL_SERVICE_UNAVAILABLE("501", "External service is unavailable."),
    EXTERNAL_SERVICE_TIMEOUT("502", "External service request timed out."),

    // Business Logic errors (600-699)
    BUSINESS_RULE_VIOLATION("600", "Business rule validation failed."),
    INVALID_OPERATION("601", "The requested operation is not valid in the current state."),
    DUPLICATE_ENTRY("602", "Duplicate entry detected.");

    private final String code;
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
