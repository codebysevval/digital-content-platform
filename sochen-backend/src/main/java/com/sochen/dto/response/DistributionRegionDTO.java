package com.sochen.dto.response;

import com.sochen.domain.enums.DistributionStatus;

public record DistributionRegionDTO(
        Long id,
        String region,
        String distributionPoints,
        String monthlyAmount,
        String lastDelivery,
        DistributionStatus status
) {
}
