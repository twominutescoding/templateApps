package com.template.business.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * Utility class for JWT (JSON Web Token) validation.
 * <p>
 * This component handles JWT token validation for tokens issued by auth-service.
 * It uses the JJWT library 0.12.6+ to parse and validate JWT tokens.
 * </p>
 * <p>
 * Note: Token generation is handled by auth-service. This class only validates tokens.
 * </p>
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Generates the HMAC signing key from the configured secret.
     *
     * @return the signing key for JWT operations
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Extracts the username from a JWT token.
     *
     * @param token the JWT token to extract the username from
     * @return the username contained in the token
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from a JWT token.
     *
     * @param token the JWT token to extract the expiration from
     * @return the expiration date of the token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from a JWT token using a claims resolver function.
     *
     * @param <T> the type of the claim to extract
     * @param token the JWT token to extract the claim from
     * @param claimsResolver function to apply to the claims to extract the desired value
     * @return the extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from a JWT token.
     * <p>
     * Uses JJWT 0.12.6+ API for parsing and validation.
     * </p>
     *
     * @param token the JWT token to parse
     * @return all claims from the token
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Checks if a JWT token has expired.
     *
     * @param token the JWT token to check
     * @return true if the token has expired, false otherwise
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validates a JWT token for expiration.
     * <p>
     * Checks if the token is valid by verifying signature and expiration.
     * This method catches all exceptions and returns false if the token
     * cannot be parsed or validated.
     * </p>
     *
     * @param token the JWT token to validate
     * @return true if the token is valid and not expired, false otherwise
     */
    public Boolean isTokenValid(String token) {
        try {
            // extractAllClaims will throw exception if signature is invalid
            extractAllClaims(token);
            // Check if token is not expired
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validates a JWT token (alias for isTokenValid).
     *
     * @param token the JWT token to validate
     * @return true if the token is valid and not expired, false otherwise
     */
    public Boolean validateToken(String token) {
        return isTokenValid(token);
    }
}
