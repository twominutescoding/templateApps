package com.template.business.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for dashboard statistics (admin)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private UserStats userStats;
    private SessionStats sessionStats;
    private List<RecentActivity> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long activeUsers;
        private long inactiveUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionStats {
        private long totalActiveSessions;
        private long sessionsLast24Hours;
        private long totalRefreshTokens;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String username;
        private String action; // LOGIN, LOGOUT, TOKEN_REFRESH
        private String ipAddress;
        private String timestamp;
    }
}
