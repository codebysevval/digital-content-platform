package com.sochen.dto.response;

public record CreatorStudioStatsDTO(
        Integer totalContent,
        String totalViews,
        String engagementRate,
        String monthlyEarnings,
        String totalEarnings
) {
}
