package com.template.business.auth.exception;

/**
 * Exception thrown when authentication fails.
 *
 * <p>This exception is used for various authentication failures including:
 * <ul>
 *   <li>Invalid username or password</li>
 *   <li>Invalid or expired JWT token</li>
 *   <li>Invalid refresh token</li>
 *   <li>Account disabled or locked</li>
 *   <li>LDAP authentication failure</li>
 * </ul>
 *
 * <p>Example usage:
 * <pre>
 * // Invalid credentials
 * throw new CustomAuthenticationException(ErrorCode.INVALID_CREDENTIALS);
 *
 * // Expired token
 * throw new CustomAuthenticationException(ErrorCode.TOKEN_EXPIRED, "Your session has expired");
 *
 * // Account disabled
 * throw new CustomAuthenticationException(ErrorCode.ACCOUNT_DISABLED, "Account is disabled", cause);
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 */
public class CustomAuthenticationException extends BaseException {

    /**
     * Constructor with error code only (uses default message).
     *
     * @param errorCode the authentication error code
     */
    public CustomAuthenticationException(ErrorCode errorCode) {
        super(errorCode);
    }

    /**
     * Constructor with error code and custom message.
     *
     * @param errorCode the authentication error code
     * @param customMessage custom error message
     */
    public CustomAuthenticationException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    /**
     * Constructor with error code, custom message, and cause.
     *
     * @param errorCode the authentication error code
     * @param customMessage custom error message
     * @param cause the underlying cause
     */
    public CustomAuthenticationException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }

    /**
     * Constructor with error code and cause (uses default message).
     *
     * @param errorCode the authentication error code
     * @param cause the underlying cause
     */
    public CustomAuthenticationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
