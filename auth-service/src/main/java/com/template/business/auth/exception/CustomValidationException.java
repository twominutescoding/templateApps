package com.template.business.auth.exception;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when request validation fails.
 *
 * <p>This exception supports both simple validation errors (single message)
 * and field-level validation errors (multiple field-specific messages).
 *
 * <p>Example usage:
 * <pre>
 * // Simple validation error
 * throw new CustomValidationException("Username is required");
 *
 * // Field-level validation errors
 * List&lt;FieldError&gt; errors = new ArrayList&lt;&gt;();
 * errors.add(new FieldError("username", "Username is required"));
 * errors.add(new FieldError("password", "Password must be at least 8 characters"));
 * throw new CustomValidationException("Validation failed", errors);
 * </pre>
 *
 * @author Template Business
 * @version 1.0
 */
@Getter
public class CustomValidationException extends BaseException {

    private final List<ApiErrorResponse.FieldError> fieldErrors;

    /**
     * Constructor for simple validation error without field details.
     *
     * @param message the validation error message
     */
    public CustomValidationException(String message) {
        super(ErrorCode.VALIDATION_ERROR, message);
        this.fieldErrors = new ArrayList<>();
    }

    /**
     * Constructor for validation error with field-level details.
     *
     * @param message the general validation error message
     * @param fieldErrors list of field-specific validation errors
     */
    public CustomValidationException(String message, List<ApiErrorResponse.FieldError> fieldErrors) {
        super(ErrorCode.VALIDATION_ERROR, message);
        this.fieldErrors = fieldErrors != null ? fieldErrors : new ArrayList<>();
    }

    /**
     * Constructor with default message and field errors.
     *
     * @param fieldErrors list of field-specific validation errors
     */
    public CustomValidationException(List<ApiErrorResponse.FieldError> fieldErrors) {
        super(ErrorCode.VALIDATION_ERROR);
        this.fieldErrors = fieldErrors != null ? fieldErrors : new ArrayList<>();
    }
}
