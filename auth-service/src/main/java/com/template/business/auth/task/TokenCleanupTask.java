package com.template.business.auth.task;

import com.template.business.auth.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task for cleaning up expired and old revoked refresh tokens.
 *
 * <p>Runs automatically to maintain database hygiene by removing:
 * <ul>
 *   <li>Expired refresh tokens (past their expiration date)</li>
 *   <li>Revoked tokens older than 30 days</li>
 * </ul>
 *
 * <p>Cleanup schedules:
 * <ul>
 *   <li>Expired tokens: Every hour</li>
 *   <li>Old revoked tokens: Every Sunday at 3:00 AM</li>
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupTask {

    private final RefreshTokenService refreshTokenService;

    /**
     * Clean up expired refresh tokens.
     * Runs every hour.
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired refresh tokens...");
        try {
            int count = refreshTokenService.cleanupExpiredTokens();
            log.info("Cleanup completed. Removed {} expired tokens", count);
        } catch (Exception e) {
            log.error("Error during expired token cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Clean up old revoked refresh tokens (older than 30 days).
     * Runs every Sunday at 3:00 AM.
     */
    @Scheduled(cron = "0 0 3 ? * SUN")
    public void cleanupOldRevokedTokens() {
        log.info("Starting cleanup of old revoked refresh tokens...");
        try {
            int count = refreshTokenService.cleanupOldRevokedTokens();
            log.info("Cleanup completed. Removed {} old revoked tokens", count);
        } catch (Exception e) {
            log.error("Error during old revoked token cleanup: {}", e.getMessage(), e);
        }
    }
}
