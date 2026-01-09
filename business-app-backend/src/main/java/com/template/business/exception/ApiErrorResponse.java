package com.template.business.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standardized error response structure for all API errors.
 *
 * <p>This class provides a consistent format for error responses across
 * the business application API. It includes error code, type, message,
 * timestamp, and optional field-level validation errors.
 *
 * <p>Example response:
 * <pre>
 * {
 *   "code": "003",
 *   "type": "VALIDATION_ERROR",
 *   "message": "Validation failed for one or more fields.",
 *   "timestamp": "2026-01-03T15:30:00",
 *   "fieldErrors": [
 *     {
 *       "field": "name",
 *       "message": "Name is required"
 *     }
 *   ]
 * }
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 * @see ErrorCode
 * @see GlobalExceptionHandler
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiErrorResponse {

    /**
     * Numeric error code (e.g., "003", "100")
     */
    private String code;

    /**
     * Error type name from ErrorCode enum (e.g., "VALIDATION_ERROR")
     */
    private String type;

    /**
     * Human-readable error message
     */
    private String message;

    /**
     * Timestamp when the error occurred
     */
    private LocalDateTime timestamp;

    /**
     * Optional field-level validation errors
     */
    private List<FieldError> fieldErrors;

    /**
     * Constructor for errors without field validation details.
     *
     * @param errorCode the error code enum
     * @param message the error message (if null, uses default from ErrorCode)
     */
    public ApiErrorResponse(ErrorCode errorCode, String message) {
        this.code = errorCode.getCode();
        this.type = errorCode.name();
        this.message = (message != null) ? message : errorCode.getDefaultMessage();
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor for validation errors with field-level details.
     *
     * @param errorCode the error code enum
     * @param message the error message
     * @param fieldErrors list of field-level errors
     */
    public ApiErrorResponse(ErrorCode errorCode, String message, List<FieldError> fieldErrors) {
        this(errorCode, message);
        this.fieldErrors = fieldErrors;
    }

    /**
     * Represents a field-level validation error.
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FieldError {
        /**
         * Name of the field that failed validation
         */
        private String field;

        /**
         * Validation error message for this field
         */
        private String message;
    }
}
