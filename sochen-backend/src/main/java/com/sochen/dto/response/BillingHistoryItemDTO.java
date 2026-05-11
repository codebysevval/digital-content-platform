package com.sochen.dto.response;

public record BillingHistoryItemDTO(
        Long id,
        String date,
        String amount,
        String plan,
        String status
) {
}
