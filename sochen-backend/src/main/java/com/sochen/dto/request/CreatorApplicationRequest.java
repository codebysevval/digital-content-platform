package com.sochen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatorApplicationRequest(
        @NotBlank @Size(min = 20, max = 2000) String rationale
) {
}
