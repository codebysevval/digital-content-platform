package com.sochen.dto.response;

import java.math.BigDecimal;

public record RevenueDataPointDTO(
        String month,
        BigDecimal mrr
) {
}
