package com.sochen.dto.response;

import java.math.BigDecimal;

public record EarningsHistoryEntryDTO(String month, BigDecimal amount) {
}
