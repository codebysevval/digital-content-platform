package com.sochen.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ContentRejectionRequest(
        @NotBlank String reason
) {
}
