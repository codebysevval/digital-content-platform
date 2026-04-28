package com.example.demo.dto;

import java.util.List;

/**
 * Figma User Dashboard ekranındaki profil, istatistik ve listeleri tek payload olarak taşır.
 */
public record UserDashboardDTO(
        UserSessionDTO profile,
        DashboardStatsDTO stats,
        List<String> categories,
        List<SubscriptionDTO> subscriptions,
        List<ContentDTO> contents
) {
}
