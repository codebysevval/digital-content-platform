package com.example.demo.dto;

/**
 * User Dashboard üzerindeki sayısal kartları besler.
 */
public record DashboardStatsDTO(
        long totalSubscriptions,
        long activeSubscriptions,
        long totalContents,
        long premiumContents,
        int totalCategories
) {
}
