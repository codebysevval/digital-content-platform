package com.sochen.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PaymentRequest(
        @NotBlank String planId,
        @NotBlank String cardNumber,
        @NotBlank String expiry,
        @NotBlank String cvv,
        @NotBlank String cardholderName
) {
}
