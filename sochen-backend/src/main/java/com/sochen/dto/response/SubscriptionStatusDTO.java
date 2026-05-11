package com.sochen.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record SubscriptionStatusDTO(
        String planName,
        BigDecimal price,
        boolean isActive,
        String nextBillingDate,
        List<String> features
) {
}
