package com.sochen.dto.request;

import com.sochen.domain.enums.ContentCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddOfflineRequest(
        @NotNull Long id,
        @NotBlank String title,
        @NotNull ContentCategory category,
        @NotBlank String thumbnail,
        @NotBlank String duration,
        @NotNull Long views,
        @NotNull Boolean subscriberOnly,
        @NotBlank String creator,
        String size
) {
}
