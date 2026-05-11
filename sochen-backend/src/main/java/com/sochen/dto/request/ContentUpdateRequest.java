package com.sochen.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ContentUpdateRequest(
        @NotBlank String title,
        @NotBlank String description,
        String thumbnailUrl,
        String topic,
        String category
) {
}
