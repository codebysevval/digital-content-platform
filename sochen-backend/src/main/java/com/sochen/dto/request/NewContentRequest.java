package com.sochen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NewContentRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotBlank String category,
        @NotBlank String topic,
        @NotBlank String duration,
        @NotNull Boolean subscriberOnly,
        String mediaUrl,
        String thumbnailUrl,
        String attachmentUrls
) {
}
