package com.template.business.auth.service;

import com.template.business.auth.dto.UserRegistrationRequest;
import com.template.business.auth.entity.User;
import com.template.business.auth.exception.ApiErrorResponse;
import com.template.business.auth.exception.CustomValidationException;
import com.template.business.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Service for user management operations.
 *
 * <p>Handles user registration, updates, and queries.
 * Passwords are automatically encrypted using BCrypt.
 *
 * @author Template Business
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registers a new user in the system.
     *
     * <p>The password is encrypted using BCrypt before storage.
     * Default values are set for status (ACTIVE) and theme (dark).
     *
     * @param request user registration details
     * @return the created user entity
     * @throws CustomValidationException if username already exists
     */
    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            List<ApiErrorResponse.FieldError> errors = new ArrayList<>();
            errors.add(new ApiErrorResponse.FieldError(
                    "username",
                    "A user with username '" + request.getUsername() + "' already exists"
            ));
            throw new CustomValidationException("Registration failed", errors);
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setCompany(request.getCompany());
        user.setStatus("ACTIVE");
        user.setCreateDate(new Date());
        user.setCreateUser("system");
        user.setTheme("dark");

        return userRepository.save(user);
    }

    /**
     * Finds a user by username.
     *
     * @param username the username to search for
     * @return Optional containing the user if found, empty otherwise
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Checks if a username already exists in the system.
     *
     * @param username the username to check
     * @return true if username exists, false otherwise
     */
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Updates an existing user.
     *
     * @param user the user entity with updated values
     * @return the updated user entity
     */
    @Transactional
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * Updates user theme preferences.
     *
     * @param username the username of the user
     * @param theme the theme mode (light or dark)
     * @param paletteId the color palette ID
     */
    @Transactional
    public void updateThemePreferences(String username, String theme, String paletteId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        user.setTheme(theme);
        user.setPaletteId(paletteId);
        userRepository.save(user);
    }
}
