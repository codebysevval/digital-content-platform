package com.sochen.dto.response;

public record PaymentResponse(
        boolean success,
        SubscriptionStatusDTO subscription
) {
}
