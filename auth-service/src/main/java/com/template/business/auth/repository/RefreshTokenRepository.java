package com.template.business.auth.repository;

import com.template.business.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Find refresh token by its hash
     */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * Find all active (valid) refresh tokens for a user and application
     * Active = not revoked AND not expired
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.username = :username " +
           "AND rt.entity = :entity " +
           "AND rt.revoked = false " +
           "AND rt.expiresAt > :now " +
           "ORDER BY rt.createDate DESC")
    List<RefreshToken> findActiveTokensByUsernameAndEntity(
            @Param("username") String username,
            @Param("entity") String entity,
            @Param("now") Date now
    );

    /**
     * Find all active refresh tokens for a user across all applications
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.username = :username " +
           "AND rt.revoked = false " +
           "AND rt.expiresAt > :now " +
           "ORDER BY rt.lastUsedAt DESC, rt.createDate DESC")
    List<RefreshToken> findActiveTokensByUsername(
            @Param("username") String username,
            @Param("now") Date now
    );

    /**
     * Count active sessions for a user and application
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.username = :username " +
           "AND rt.entity = :entity " +
           "AND rt.revoked = false " +
           "AND rt.expiresAt > :now")
    long countActiveTokensByUsernameAndEntity(
            @Param("username") String username,
            @Param("entity") String entity,
            @Param("now") Date now
    );

    /**
     * Revoke all tokens for a specific user and application (logout all devices)
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true, rt.revokedAt = :now " +
           "WHERE rt.username = :username " +
           "AND rt.entity = :entity " +
           "AND rt.revoked = false")
    int revokeAllTokensByUsernameAndEntity(
            @Param("username") String username,
            @Param("entity") String entity,
            @Param("now") Date now
    );

    /**
     * Revoke all tokens for a user across all applications
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true, rt.revokedAt = :now " +
           "WHERE rt.username = :username " +
           "AND rt.revoked = false")
    int revokeAllTokensByUsername(
            @Param("username") String username,
            @Param("now") Date now
    );

    /**
     * Revoke a specific token by its hash
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true, rt.revokedAt = :now " +
           "WHERE rt.tokenHash = :tokenHash")
    int revokeTokenByHash(
            @Param("tokenHash") String tokenHash,
            @Param("now") Date now
    );

    /**
     * Delete expired tokens (cleanup job)
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now")
    int deleteExpiredTokens(@Param("now") Date now);

    /**
     * Delete revoked tokens older than specified date (cleanup job)
     */
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.revoked = true AND rt.revokedAt < :date")
    int deleteRevokedTokensOlderThan(@Param("date") Date date);

    /**
     * Find all tokens for admin monitoring (with pagination support via JpaRepository)
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.revoked = false AND rt.expiresAt > :now " +
           "ORDER BY rt.lastUsedAt DESC, rt.createDate DESC")
    List<RefreshToken> findAllActiveTokens(@Param("now") Date now);

    /**
     * Find tokens by IP address (security monitoring)
     */
    List<RefreshToken> findByIpAddressAndRevokedFalse(String ipAddress);

    /**
     * Find the oldest active token for a user and application
     * Used when enforcing session limits
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.username = :username " +
           "AND rt.entity = :entity " +
           "AND rt.revoked = false " +
           "AND rt.expiresAt > :now " +
           "ORDER BY rt.createDate ASC")
    List<RefreshToken> findOldestTokensByUsernameAndEntity(
            @Param("username") String username,
            @Param("entity") String entity,
            @Param("now") Date now
    );
}
