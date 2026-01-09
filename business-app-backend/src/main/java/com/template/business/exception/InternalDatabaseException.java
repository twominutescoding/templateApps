package com.template.business.exception;

/**
 * Exception thrown when database operations fail.
 *
 * <p>This exception wraps database-related errors including:
 * <ul>
 *   <li>Data integrity violations (unique constraints, foreign keys)</li>
 *   <li>Database connection errors</li>
 *   <li>Transaction failures</li>
 *   <li>Lazy initialization errors</li>
 * </ul>
 *
 * <p>Example usage:
 * <pre>
 * try {
 *     productRepository.save(product);
 * } catch (DataIntegrityViolationException e) {
 *     throw new InternalDatabaseException(
 *         ErrorCode.DATA_INTEGRITY_ERROR,
 *         "Product name already exists",
 *         e
 *     );
 * }
 *
 * // Lazy initialization error
 * throw new InternalDatabaseException(
 *     ErrorCode.LAZY_INITIALIZATION_ERROR,
 *     "Failed to load product details",
 *     lazyInitException
 * );
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 */
public class InternalDatabaseException extends BaseException {

    /**
     * Constructor with error code only (uses default message).
     *
     * @param errorCode the database error code
     */
    public InternalDatabaseException(ErrorCode errorCode) {
        super(errorCode);
    }

    /**
     * Constructor with error code and custom message.
     *
     * @param errorCode the database error code
     * @param customMessage custom error message
     */
    public InternalDatabaseException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    /**
     * Constructor with error code, custom message, and cause.
     *
     * @param errorCode the database error code
     * @param customMessage custom error message
     * @param cause the underlying database exception
     */
    public InternalDatabaseException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }

    /**
     * Constructor with error code and cause (uses default message).
     *
     * @param errorCode the database error code
     * @param cause the underlying database exception
     */
    public InternalDatabaseException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
