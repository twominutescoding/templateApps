package com.template.business.auth.service;

import com.template.business.auth.dto.DashboardStatsDTO;
import com.template.business.auth.repository.RefreshTokenRepository;
import com.template.business.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for dashboard statistics (ADMIN only)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardStatisticsService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Get dashboard statistics
     */
    public DashboardStatsDTO getDashboardStats() {
        // User statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream()
                .filter(user -> "ACTIVE".equals(user.getStatus()))
                .count();
        long inactiveUsers = totalUsers - activeUsers;

        DashboardStatsDTO.UserStats userStats = DashboardStatsDTO.UserStats.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .build();

        // Session statistics
        Date now = new Date();
        long totalActiveSessions = refreshTokenRepository.findAllActiveTokens(now).size();

        // Sessions created in last 24 hours
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR, -24);
        Date last24Hours = cal.getTime();

        long sessionsLast24Hours = refreshTokenRepository.findAll().stream()
                .filter(token -> token.getCreateDate() != null && token.getCreateDate().after(last24Hours))
                .count();

        long totalRefreshTokens = refreshTokenRepository.count();

        DashboardStatsDTO.SessionStats sessionStats = DashboardStatsDTO.SessionStats.builder()
                .totalActiveSessions(totalActiveSessions)
                .sessionsLast24Hours(sessionsLast24Hours)
                .totalRefreshTokens(totalRefreshTokens)
                .build();

        // Sessions grouped by entity
        Map<String, List<com.template.business.auth.entity.RefreshToken>> sessionsByEntity =
            refreshTokenRepository.findAllActiveTokens(now).stream()
                .collect(Collectors.groupingBy(com.template.business.auth.entity.RefreshToken::getEntity));

        List<DashboardStatsDTO.EntitySessionStats> entitySessionStats = sessionsByEntity.entrySet().stream()
                .map(entry -> DashboardStatsDTO.EntitySessionStats.builder()
                        .entity(entry.getKey())
                        .activeSessions(entry.getValue().size())
                        .totalUsers(entry.getValue().stream()
                                .map(com.template.business.auth.entity.RefreshToken::getUsername)
                                .distinct()
                                .count())
                        .build())
                .sorted(Comparator.comparing(DashboardStatsDTO.EntitySessionStats::getEntity))
                .toList();

        // Recent activity (last 10 login sessions - exclude token refreshes)
        List<DashboardStatsDTO.RecentActivity> recentActivity = refreshTokenRepository.findAll().stream()
                .filter(token -> "LOGIN".equals(token.getCreationType())) // Only show actual logins, not token refreshes
                .sorted((a, b) -> b.getCreateDate().compareTo(a.getCreateDate()))
                .limit(10)
                .map(token -> DashboardStatsDTO.RecentActivity.builder()
                        .username(token.getUsername())
                        .action("LOGIN")
                        .ipAddress(token.getIpAddress())
                        .timestamp(token.getCreateDate().toString())
                        .build())
                .toList();

        return DashboardStatsDTO.builder()
                .userStats(userStats)
                .sessionStats(sessionStats)
                .sessionsByEntity(entitySessionStats)
                .recentActivity(recentActivity)
                .build();
    }
}
