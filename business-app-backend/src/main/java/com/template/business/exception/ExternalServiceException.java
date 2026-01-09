package com.template.business.exception;

/**
 * Exception thrown when external service calls fail.
 *
 * <p>This exception is used for errors related to external service integrations including:
 * <ul>
 *   <li>External authentication service failures</li>
 *   <li>External API unavailability</li>
 *   <li>External service timeouts</li>
 *   <li>Payment gateway errors</li>
 *   <li>Third-party service integration failures</li>
 * </ul>
 *
 * <p>Example usage:
 * <pre>
 * // External auth service failed
 * throw new ExternalServiceException(
 *     ErrorCode.EXTERNAL_AUTH_ERROR,
 *     "Failed to authenticate with auth-service"
 * );
 *
 * // Service unavailable
 * try {
 *     authServiceClient.login(credentials);
 * } catch (FeignException e) {
 *     throw new ExternalServiceException(
 *         ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
 *         "Auth service is unavailable",
 *         e
 *     );
 * }
 *
 * // Timeout
 * throw new ExternalServiceException(
 *     ErrorCode.EXTERNAL_SERVICE_TIMEOUT,
 *     "Payment gateway request timed out"
 * );
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 */
public class ExternalServiceException extends BaseException {

    /**
     * Constructor with error code only (uses default message).
     *
     * @param errorCode the external service error code
     */
    public ExternalServiceException(ErrorCode errorCode) {
        super(errorCode);
    }

    /**
     * Constructor with error code and custom message.
     *
     * @param errorCode the external service error code
     * @param customMessage custom error message
     */
    public ExternalServiceException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    /**
     * Constructor with error code, custom message, and cause.
     *
     * @param errorCode the external service error code
     * @param customMessage custom error message
     * @param cause the underlying cause (e.g., FeignException, RestClientException)
     */
    public ExternalServiceException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }

    /**
     * Constructor with error code and cause (uses default message).
     *
     * @param errorCode the external service error code
     * @param cause the underlying cause
     */
    public ExternalServiceException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
