package com.template.business.auth.exception;

/**
 * Exception thrown when a requested resource cannot be found.
 *
 * <p>This exception is used when entities or resources don't exist:
 * <ul>
 *   <li>User not found</li>
 *   <li>Role not found</li>
 *   <li>Session not found</li>
 *   <li>Refresh token not found</li>
 * </ul>
 *
 * <p>Example usage:
 * <pre>
 * // User not found
 * throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, "User 'admin' not found");
 *
 * // Session not found
 * throw new ResourceNotFoundException(ErrorCode.SESSION_NOT_FOUND, "Session with ID 123 not found");
 *
 * // Generic entity not found
 * throw new ResourceNotFoundException(ErrorCode.ENTITY_NOT_FOUND);
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
}
