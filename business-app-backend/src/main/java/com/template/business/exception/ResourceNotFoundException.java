package com.template.business.exception;

/**
 * Exception thrown when a requested resource cannot be found.
 *
 * <p>This exception is used when entities or resources don't exist:
 * <ul>
 *   <li>User not found</li>
 *   <li>Product not found</li>
 *   <li>Entity not found by ID</li>
 * </ul>
 *
 * <p>Example usage:
 * <pre>
 * // Generic entity not found
 * throw new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND);
 *
 * // User not found with custom message
 * throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User with ID 123 not found");
 *
 * // Product not found with field details (backward compatible)
 * throw new ResourceNotFoundException("Product", "id", 123);
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 */
public class ResourceNotFoundException extends BaseException {

    /**
     * Constructor with error code only (uses default message).
     *
     * @param errorCode the resource error code
     */
    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    /**
     * Constructor with error code and custom message.
     *
     * @param errorCode the resource error code
     * @param customMessage custom error message
     */
    public ResourceNotFoundException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    /**
     * Constructor with error code, custom message, and cause.
     *
     * @param errorCode the resource error code
     * @param customMessage custom error message
     * @param cause the underlying cause
     */
    public ResourceNotFoundException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }

    /**
     * Legacy constructor for backward compatibility.
     * Creates a formatted message from resource details.
     *
     * @param resourceName the name of the resource type (e.g., "Product", "User")
     * @param fieldName the field name used for lookup (e.g., "id", "username")
     * @param fieldValue the value that was not found
     * @deprecated Use {@link #ResourceNotFoundException(ErrorCode, String)} instead
     */
    @Deprecated
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(ErrorCode.ENTITY_NOT_FOUND,
              String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
