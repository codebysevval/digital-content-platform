package com.sochen.dto.request;

import jakarta.validation.constraints.Min;

public record SimulateTrafficRequest(
        @Min(0) long views,
        @Min(0) long likes
) {
}
