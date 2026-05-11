package com.sochen.dto.response;

import java.math.BigDecimal;

public record FinancialDataPointDTO(
        String month,
        BigDecimal mrr,
        Integer subscribers
) {
}
