package com.example.demo.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record SubscriptionDTO(
        Long id,
        String planName,
        double price,
        String currency,
        String billingCycle,
        LocalDate startDate,
        LocalDate endDate,
        boolean active,
        Long userId
) {
}
