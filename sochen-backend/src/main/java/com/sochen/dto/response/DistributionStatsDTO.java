package com.sochen.dto.response;

public record DistributionStatsDTO(
        Integer activeRegions,
        Integer newRegions,
        String monthlyDistribution,
        Integer pendingOrders,
        String deliveryRate
) {
}
