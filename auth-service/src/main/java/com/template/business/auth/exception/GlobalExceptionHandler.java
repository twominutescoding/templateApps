package com.template.business.auth.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.LazyInitializationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.ArrayList;
import java.util.List;

/**
 * Global exception handler for the auth-service.
 *
 * <p>This class provides centralized exception handling across all controllers
 * using Spring's @RestControllerAdvice. It converts exceptions into standardized
 * ApiErrorResponse objects with appropriate HTTP status codes.
 *
 * <p>Handles the following exception categories:
 * <ul>
 *   <li>Custom application exceptions (BaseException and subclasses)</li>
 *   <li>Spring Security exceptions (AuthenticationException, AccessDeniedException)</li>
 *   <li>Validation exceptions (MethodArgumentNotValidException)</li>
 *   <li>Database exceptions (DataIntegrityViolationException, LazyInitializationException)</li>
 *   <li>HTTP protocol exceptions (method not allowed, unsupported media type, etc.)</li>
 *   <li>Generic exceptions (fallback handler)</li>
 * </ul>
 *
 * @author Template Business
 * @version 1.0
 * @see ApiErrorResponse
 * @see ErrorCode
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ========================================================================
    // Custom Application Exceptions
    // ========================================================================

    /**
     * Handles validation exceptions with field-level error details.
     *
     * @param ex the validation exception
     * @param request the HTTP request
     * @return error response with field validation details
     */
    @ExceptionHandler(CustomValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            CustomValidationException ex, HttpServletRequest request) {
        log.warn("Validation error on {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = new ApiErrorResponse(
                ex.getErrorCode(),
                ex.getCustomMessage(),
                ex.getFieldErrors()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles authentication exceptions (invalid credentials, expired tokens, etc.).
     *
     * @param ex the authentication exception
     * @param request the HTTP request
     * @return error response with 401 status
     */
    @ExceptionHandler(CustomAuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
            CustomAuthenticationException ex, HttpServletRequest request) {
        log.warn("Authentication error on {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = new ApiErrorResponse(ex.getErrorCode(), ex.getCustomMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handles authorization exceptions (access denied, insufficient permissions).
     *
     * @param ex the authorization exception
     * @param request the HTTP request
     * @return error response with 403 status
     */
    @ExceptionHandler(CustomAuthorizationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthorizationException(
            CustomAuthorizationException ex, HttpServletRequest request) {
        log.warn("Authorization error on {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = new ApiErrorResponse(ex.getErrorCode(), ex.getCustomMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    /**
     * Handles resource not found exceptions (user, role, session not found).
     *
     * @param ex the resource not found exception
     * @param request the HTTP request
     * @return error response with 404 status
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found on {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = new ApiErrorResponse(ex.getErrorCode(), ex.getCustomMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handles database exceptions (data integrity violations, connection errors).
     *
     * @param ex the database exception
     * @param request the HTTP request
     * @return error response with 500 status
     */
    @ExceptionHandler(InternalDatabaseException.class)
    public ResponseEntity<ApiErrorResponse> handleDatabaseException(
            InternalDatabaseException ex, HttpServletRequest request) {
        log.error("Database error on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiErrorResponse response = new ApiErrorResponse(ex.getErrorCode(), ex.getCustomMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Handles internal API exceptions (unexpected errors, service failures).
     *
     * @param ex the internal API exception
     * @param request the HTTP request
     * @return error response with 500 status
     */
    @ExceptionHandler(InternalApiException.class)
    public ResponseEntity<ApiErrorResponse> handleInternalApiException(
            InternalApiException ex, HttpServletRequest request) {
        log.error("Internal API error on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiErrorResponse response = new ApiErrorResponse(ex.getErrorCode(), ex.getCustomMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // ========================================================================
    // Spring Security Exceptions
    // ========================================================================

    /**
     * Handles Spring Security authentication exceptions.
     *
     * <p>This includes:
     * <ul>
     *   <li>BadCredentialsException - Invalid username/password</li>
     *   <li>DisabledException - Account disabled</li>
     *   <li>LockedException - Account locked</li>
     *   <li>UsernameNotFoundException - User not found</li>
     * </ul>
     *
     * @param ex the authentication exception
     * @param request the HTTP request
     * @return error response with 401 status
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleSpringAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        log.warn("Spring Security authentication error on {}: {}", request.getRequestURI(), ex.getMessage());

        ErrorCode errorCode;
        String message;

        if (ex instanceof BadCredentialsException) {
            errorCode = ErrorCode.INVALID_CREDENTIALS;
            message = "Invalid username or password.";
        } else if (ex instanceof DisabledException) {
            errorCode = ErrorCode.ACCOUNT_DISABLED;
            message = "Account is disabled.";
        } else if (ex instanceof LockedException) {
            errorCode = ErrorCode.ACCOUNT_LOCKED;
            message = "Account is locked.";
        } else if (ex instanceof UsernameNotFoundException) {
            errorCode = ErrorCode.USER_NOT_FOUND;
            message = ex.getMessage();
        } else {
            errorCode = ErrorCode.AUTHENTICATION_ERROR;
            message = "Authentication failed.";
        }

        ApiErrorResponse response = new ApiErrorResponse(errorCode, message);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    /**
     * Handles Spring Security access denied exceptions.
     *
     * <p>This is thrown when a user tries to access a resource they don't have
     * permission for (e.g., regular user accessing admin endpoint).
     *
     * @param ex the access denied exception
     * @param request the HTTP request
     * @return error response with 403 status
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied on {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = new ApiErrorResponse(
                ErrorCode.ACCESS_DENIED,
                "You do not have permission to perform this action."
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    // ========================================================================
    // Spring Validation Exceptions
    // ========================================================================

    /**
     * Handles @Valid annotation validation failures.
     *
     * <p>This exception is thrown when request body validation fails based on
     * Jakarta Validation annotations (@NotNull, @Size, @Email, etc.).
     *
     * @param ex the method argument validation exception
     * @param request the HTTP request
     * @return error response with field-level validation details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation error on {}: {} field errors", request.getRequestURI(), ex.getFieldErrorCount());

        List<ApiErrorResponse.FieldError> fieldErrors = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.add(new ApiErrorResponse.FieldError(
                    error.getField(),
                    error.getDefaultMessage()
            ));
        }

        ApiErrorResponse response = new ApiErrorResponse(
                ErrorCode.VALIDATION_ERROR,
                "Validation failed for one or more fields.",
                fieldErrors
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles type mismatch exceptions (e.g., passing string for integer parameter).
     *
     * @param ex the type mismatch exception
     * @param request the HTTP request
     * @return error response with validation error
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        log.warn("Type mismatch on {}: {} should be {}", request.getRequestURI(), ex.getName(), ex.getRequiredType());

        String message = String.format("Parameter '%s' has invalid type. Expected: %s",
                ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");

        ApiErrorResponse response = new ApiErrorResponse(ErrorCode.INVALID_ARGUMENT, message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles missing required request parameters.
     *
     * @param ex the missing parameter exception
     * @param request the HTTP request
     * @return error response with validation error
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        log.warn("Missing parameter on {}: {}", request.getRequestURI(), ex.getParameterName());

        String message = String.format("Required parameter '%s' is missing.", ex.getParameterName());
        ApiErrorResponse response = new ApiErrorResponse(ErrorCode.MISSING_PARAMETER, message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ========================================================================
    // Database Exceptions
    // ========================================================================

    /**
     * Handles data integrity violations (unique constraints, foreign keys).
     *
     * <p>Common scenarios:
     * <ul>
     *   <li>Duplicate username (unique constraint violation)</li>
     *   <li>Foreign key constraint violation</li>
     *   <li>Not null constraint violation</li>
     * </ul>
     *
     * @param ex the data integrity exception
     * @param request the HTTP request
     * @return error response with database error
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.error("Data integrity violation on {}: {}", request.getRequestURI(), ex.getMessage());

        String message = "A database constraint was violated. ";
        if (ex.getMessage() != null && ex.getMessage().contains("unique")) {
            message += "The provided value already exists.";
        } else if (ex.getMessage() != null && ex.getMessage().contains("foreign key")) {
            message += "Referenced entity does not exist.";
        } else {
            message += "Please check your input data.";
        }

        ApiErrorResponse response = new ApiErrorResponse(ErrorCode.DATA_INTEGRITY_ERROR, message);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * Handles Hibernate lazy initialization exceptions.
     *
     * <p>This occurs when trying to access a lazy-loaded collection outside
     * of a transaction. Solution: Add @Transactional to the method.
     *
     * @param ex the lazy initialization exception
     * @param request the HTTP request
     * @return error response with database error
     */
    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<ApiErrorResponse> handleLazyInitialization(
            LazyInitializationException ex, HttpServletRequest request) {
        log.error("Lazy initialization error on {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = new ApiErrorResponse(
                ErrorCode.LAZY_INITIALIZATION_ERROR,
                "Failed to load related data from database."
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    // ========================================================================
    // HTTP Protocol Exceptions
    // ========================================================================

    /**
     * Handles unsupported HTTP methods (e.g., GET on POST endpoint).
     *
     * @param ex the method not supported exception
     * @param request the HTTP request
     * @return error response with 405 status
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        log.warn("Method not supported on {}: {}", request.getRequestURI(), ex.getMethod());

        String message = String.format("HTTP method '%s' is not supported for this endpoint. Supported methods: %s",
                ex.getMethod(), ex.getSupportedHttpMethods());

        ApiErrorResponse response = new ApiErrorResponse(ErrorCode.METHOD_NOT_ALLOWED, message);
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(response);
    }

    /**
     * Handles unsupported media types (e.g., sending XML to JSON endpoint).
     *
     * @param ex the media type not supported exception
     * @param request the HTTP request
     * @return error response with 415 status
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        log.warn("Media type not supported on {}: {}", request.getRequestURI(), ex.getContentType());

        String message = String.format("Content type '%s' is not supported. Supported types: %s",
                ex.getContentType(), ex.getSupportedMediaTypes());

        ApiErrorResponse response = new ApiErrorResponse(ErrorCode.UNSUPPORTED_MEDIA_TYPE, message);
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(response);
    }

    /**
     * Handles malformed JSON in request body.
     *
     * @param ex the message not readable exception
     * @param request the HTTP request
     * @return error response with 400 status
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Malformed request on {}: {}", request.getRequestURI(), ex.getMessage());

        ApiErrorResponse response = new ApiErrorResponse(
                ErrorCode.MALFORMED_REQUEST,
                "Request body is missing or malformed. Please check JSON syntax."
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ========================================================================
    // Generic Exception Handler (Fallback)
    // ========================================================================

    /**
     * Handles all other uncaught exceptions.
     *
     * <p>This is the fallback handler for unexpected errors. It logs the full
     * stack trace and returns a generic error response to avoid exposing
     * sensitive implementation details.
     *
     * @param ex the exception
     * @param request the HTTP request
     * @return generic error response with 500 status
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ApiErrorResponse response = new ApiErrorResponse(
                ErrorCode.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please contact support if the problem persists."
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
