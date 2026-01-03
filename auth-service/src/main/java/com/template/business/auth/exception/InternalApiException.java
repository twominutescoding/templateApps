package com.template.business.auth.exception;

/**
 * Exception thrown for general internal API errors.
 *
 * <p>This exception is used for unexpected internal errors that don't fit
 * into other specific exception categories. It typically indicates a bug
 * or configuration issue in the application.
 *
 * <p>Example usage:
 * <pre>
 * // Generic internal error
 * throw new InternalApiException(ErrorCode.INTERNAL_SERVER_ERROR);
 *
 * // Internal error with details
 * throw new InternalApiException(
 *     ErrorCode.INTERNAL_SERVER_ERROR,
 *     "Failed to generate JWT token",
 *     jwtException
 * );
 *
 * // LDAP connection error
 * throw new InternalApiException(
 *     ErrorCode.LDAP_CONNECTION_ERROR,
 *     "Unable to connect to LDAP server",
 *     ldapException
 * );
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 */
public class InternalApiException extends BaseException {

    /**
     * Constructor with error code only (uses default message).
     *
     * @param errorCode the internal error code
     */
    public InternalApiException(ErrorCode errorCode) {
        super(errorCode);
    }

    /**
     * Constructor with error code and custom message.
     *
     * @param errorCode the internal error code
     * @param customMessage custom error message
     */
    public InternalApiException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    /**
     * Constructor with error code, custom message, and cause.
     *
     * @param errorCode the internal error code
     * @param customMessage custom error message
     * @param cause the underlying cause
     */
    public InternalApiException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }

    /**
     * Constructor with error code and cause (uses default message).
     *
     * @param errorCode the internal error code
     * @param cause the underlying cause
     */
    public InternalApiException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
