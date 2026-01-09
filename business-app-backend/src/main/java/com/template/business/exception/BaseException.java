package com.template.business.exception;

import lombok.Getter;

/**
 * Base exception class for all custom exceptions in the business application.
 *
 * <p>This class provides common functionality for all custom exceptions including
 * error code mapping and standardized error messages.
 *
 * @author Template Business
 * @version 1.0
 */
@Getter
public class BaseException extends RuntimeException {

    private final ErrorCode errorCode;
    private final String customMessage;

    /**
     * Constructor with error code only (uses default message from ErrorCode).
     *
     * @param errorCode the error code enum
     */
    public BaseException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.customMessage = errorCode.getDefaultMessage();
    }

    /**
     * Constructor with error code and custom message.
     *
     * @param errorCode the error code enum
     * @param customMessage custom error message (overrides default)
     */
    public BaseException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.customMessage = customMessage;
    }

    /**
     * Constructor with error code, custom message, and cause.
     *
     * @param errorCode the error code enum
     * @param customMessage custom error message
     * @param cause the underlying cause
     */
    public BaseException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(customMessage, cause);
        this.errorCode = errorCode;
        this.customMessage = customMessage;
    }

    /**
     * Constructor with error code and cause (uses default message).
     *
     * @param errorCode the error code enum
     * @param cause the underlying cause
     */
    public BaseException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getDefaultMessage(), cause);
        this.errorCode = errorCode;
        this.customMessage = errorCode.getDefaultMessage();
    }
}
