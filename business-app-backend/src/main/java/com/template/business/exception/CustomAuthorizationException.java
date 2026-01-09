package com.template.business.exception;

/**
 * Exception thrown when user lacks sufficient permissions for an operation.
 *
 * <p>This exception is used for authorization failures including:
 * <ul>
 *   <li>Access denied to protected resource</li>
 *   <li>Insufficient permissions/roles</li>
 *   <li>Unauthorized access to another user's data</li>
 * </ul>
 *
 * <p>Example usage:
 * <pre>
 * // Access denied
 * throw new CustomAuthorizationException(ErrorCode.ACCESS_DENIED);
 *
 * // Insufficient permissions
 * throw new CustomAuthorizationException(
 *     ErrorCode.INSUFFICIENT_PERMISSIONS,
 *     "ADMIN role required to access this resource"
 * );
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 */
public class CustomAuthorizationException extends BaseException {

    /**
     * Constructor with error code only (uses default message).
     *
     * @param errorCode the authorization error code
     */
    public CustomAuthorizationException(ErrorCode errorCode) {
        super(errorCode);
    }

    /**
     * Constructor with error code and custom message.
     *
     * @param errorCode the authorization error code
     * @param customMessage custom error message
     */
    public CustomAuthorizationException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    /**
     * Constructor with error code, custom message, and cause.
     *
     * @param errorCode the authorization error code
     * @param customMessage custom error message
     * @param cause the underlying cause
     */
    public CustomAuthorizationException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }
}
