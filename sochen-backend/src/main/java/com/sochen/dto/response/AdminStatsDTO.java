package com.sochen.dto.response;

public record AdminStatsDTO(
        String monthlyRevenue,
        String monthlyRevenueChange,
        String activeSubscribers,
        String activeSubscribersChange,
        String totalContent,
        String totalContentChange,
        String totalUsers,
        String totalUsersChange,
        String churnRate,
        String churnRateChange,
        String arpu,
        String growthRate
) {
}
