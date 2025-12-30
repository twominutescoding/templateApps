package com.template.business.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Utility class for JWT (JSON Web Token) operations.
 * <p>
 * This component handles all JWT-related functionality including token generation,
 * validation, and claims extraction. It uses the JJWT library to create and parse
 * JWT tokens with HS256 signature algorithm.
 * </p>
 * <p>
 * Key features:
 * <ul>
 *   <li>JWT token generation with custom claims (username, roles)</li>
 *   <li>Token validation (signature, expiration, username matching)</li>
 *   <li>Claims extraction (username, expiration, custom claims)</li>
 *   <li>Configurable secret key and expiration time via application properties</li>
 *   <li>Support for embedding user roles in token claims</li>
 * </ul>
 * </p>
 * <p>
 * Configuration properties:
 * <ul>
 *   <li>{@code jwt.secret} - Secret key for token signing</li>
 *   <li>{@code jwt.expiration} - Token expiration time in milliseconds</li>
 * </ul>
 * </p>
 *
 * @author Template Business
 * @version 1.0
 * @see io.jsonwebtoken.Jwts
 * @see org.springframework.security.core.userdetails.UserDetails
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Generates the HMAC signing key from the configured secret.
     * <p>
     * Converts the secret string to bytes and creates an HMAC SHA key
     * suitable for HS256 signature algorithm.
     * </p>
     *
     * @return the signing key for JWT operations
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Extracts the username from a JWT token.
     * <p>
     * The username is stored in the token's subject claim.
     * </p>
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
     * <p>
     * This generic method allows extraction of any claim from the token by
     * providing a function that operates on the Claims object.
     * </p>
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
     * Parses and validates the token signature, then returns all claims
     * contained in the token body.
     * </p>
     *
     * @param token the JWT token to parse
     * @return all claims from the token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
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
     * Generates a JWT token for an authenticated user.
     * <p>
     * Creates a token containing the username as the subject and the user's
     * authorities (roles) as a custom claim. The token is signed with the
     * configured secret and includes an expiration time.
     * </p>
     *
     * @param userDetails the authenticated user's details including authorities
     * @return a signed JWT token as a string
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * Generates a JWT token with specified username and roles.
     * <p>
     * This overloaded method allows token generation without a UserDetails object,
     * useful for scenarios where roles are already in string format.
     * </p>
     *
     * @param username the username to embed in the token
     * @param roles list of role strings to embed in the token
     * @return a signed JWT token as a string
     */
    public String generateToken(String username, java.util.List<String> roles) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles);
        return createToken(claims, username);
    }

    /**
     * Creates a JWT token with specified claims and subject.
     * <p>
     * Builds the JWT with custom claims, subject (username), issued-at time,
     * and expiration time. The token is signed using HS256 algorithm.
     * </p>
     *
     * @param claims custom claims to embed in the token
     * @param subject the subject (typically username) for the token
     * @return the compact JWT token string
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Validates a JWT token against a UserDetails object.
     * <p>
     * Verifies that the username in the token matches the UserDetails username
     * and that the token has not expired.
     * </p>
     *
     * @param token the JWT token to validate
     * @param userDetails the user details to validate against
     * @return true if the token is valid for the given user, false otherwise
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    /**
     * Validates a JWT token for expiration.
     * <p>
     * Checks if the token is valid by verifying it has not expired.
     * This method catches all exceptions and returns false if the token
     * cannot be parsed or validated.
     * </p>
     *
     * @param token the JWT token to validate
     * @return true if the token is valid and not expired, false otherwise
     */
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
