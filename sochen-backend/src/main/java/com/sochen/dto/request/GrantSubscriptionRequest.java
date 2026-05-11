package com.sochen.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record GrantSubscriptionRequest(
        @NotBlank String planId,
        @Min(1) int months
) {
}
