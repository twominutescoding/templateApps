package com.template.business.auth.exception;

import com.template.business.auth.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for the authentication service REST API.
 * <p>
 * This class provides centralized exception handling across all controllers
 * using Spring's @RestControllerAdvice. It intercepts exceptions thrown by
 * controllers and converts them into appropriate HTTP responses with
 * consistent error message format.
 * </p>
 * <p>
 * Handled exceptions:
 * <ul>
 *   <li>MethodArgumentNotValidException - Bean validation failures (400 Bad Request)</li>
 *   <li>BadCredentialsException - Invalid authentication credentials (401 Unauthorized)</li>
 *   <li>UsernameNotFoundException - User not found during authentication (401 Unauthorized)</li>
 *   <li>Exception - All other uncaught exceptions (500 Internal Server Error)</li>
 * </ul>
 * </p>
 * <p>
 * All responses follow a consistent structure using the ApiResponse DTO,
 * ensuring clients receive uniform error messages. Security-sensitive
 * exceptions (authentication failures) return generic messages to prevent
 * information leakage.
 * </p>
 * <p>
 * Logging strategy:
 * <ul>
 *   <li>Validation errors - WARN level (expected user errors)</li>
 *   <li>Authentication failures - ERROR level (security events)</li>
 *   <li>Unexpected exceptions - ERROR level with stack traces</li>
 * </ul>
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see org.springframework.web.bind.annotation.RestControllerAdvice
 * @see com.template.business.auth.dto.ApiResponse
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles bean validation exceptions from request body validation.
     * <p>
     * This method is triggered when @Valid or @Validated annotations detect
     * constraint violations in request DTOs. It collects all field errors
     * and returns them in a map format with field names as keys and error
     * messages as values.
     * </p>
     * <p>
     * Example response:
     * <pre>
     * {
     *   "success": false,
     *   "message": "Validation failed",
     *   "data": {
     *     "username": "must not be blank",
     *     "password": "size must be between 8 and 50"
     *   }
     * }
     * </pre>
     * </p>
     *
     * @param ex the MethodArgumentNotValidException containing validation errors
     * @return ResponseEntity with BAD_REQUEST status and error details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        log.warn("Validation failed with {} errors", errors.size());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.<Map<String, String>>builder()
                        .success(false)
                        .message("Validation failed")
                        .data(errors)
                        .build());
    }

    /**
     * Handles authentication failures due to invalid credentials.
     * <p>
     * This method intercepts BadCredentialsException thrown during the
     * authentication process. For security reasons, it returns a generic
     * error message without revealing whether the username or password
     * was incorrect.
     * </p>
     *
     * @param ex the BadCredentialsException thrown during authentication
     * @return ResponseEntity with UNAUTHORIZED status and generic error message
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        log.error("Bad credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password"));
    }

    /**
     * Handles exceptions when a user is not found during authentication.
     * <p>
     * This method intercepts UsernameNotFoundException thrown when attempting
     * to load user details. For security reasons, it returns the same generic
     * error message as BadCredentialsException to prevent username enumeration
     * attacks.
     * </p>
     *
     * @param ex the UsernameNotFoundException thrown during user lookup
     * @return ResponseEntity with UNAUTHORIZED status and generic error message
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsernameNotFound(UsernameNotFoundException ex) {
        log.error("User not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password"));
    }

    /**
     * Handles all uncaught exceptions as a safety net.
     * <p>
     * This method catches any exception not explicitly handled by other
     * exception handlers. It logs the full stack trace for debugging and
     * returns a generic error message to the client to avoid exposing
     * internal implementation details.
     * </p>
     *
     * @param ex the unhandled exception
     * @return ResponseEntity with INTERNAL_SERVER_ERROR status and generic error message
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred"));
    }
}
