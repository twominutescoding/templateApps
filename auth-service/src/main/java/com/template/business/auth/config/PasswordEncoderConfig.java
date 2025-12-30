package com.template.business.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class for password encoding in the authentication service.
 * <p>
 * This configuration provides a BCrypt password encoder bean that is used
 * throughout the application for secure password hashing and verification.
 * BCrypt is a strong, adaptive hashing function designed specifically for
 * password hashing with built-in salt generation.
 * </p>
 * <p>
 * Key features of BCrypt:
 * <ul>
 *   <li>Automatic salt generation for each password</li>
 *   <li>Configurable cost factor (work factor) for future-proofing</li>
 *   <li>One-way hashing (cannot be reversed)</li>
 *   <li>Resistant to rainbow table attacks</li>
 *   <li>Industry standard for password storage</li>
 * </ul>
 * </p>
 * <p>
 * The password encoder is used by:
 * <ul>
 *   <li>CustomAuthenticationProvider for password verification</li>
 *   <li>DataInitializer for encoding sample user passwords</li>
 *   <li>User registration processes for encoding new passwords</li>
 * </ul>
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
 * @see org.springframework.security.crypto.password.PasswordEncoder
 */
@Configuration
public class PasswordEncoderConfig {

    /**
     * Creates and configures a BCrypt password encoder bean.
     * <p>
     * The BCryptPasswordEncoder uses a default strength of 10 (2^10 rounds)
     * which provides a good balance between security and performance.
     * Each password is automatically salted with a randomly generated salt.
     * </p>
     *
     * @return a configured BCryptPasswordEncoder instance
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
