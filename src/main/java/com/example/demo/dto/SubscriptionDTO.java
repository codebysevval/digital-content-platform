package com.example.demo.dto;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record SubscriptionDTO(
        Long id,
        String planName,
        LocalDate startDate,
        LocalDate endDate,
        boolean active,
        Long userId
) {
}
