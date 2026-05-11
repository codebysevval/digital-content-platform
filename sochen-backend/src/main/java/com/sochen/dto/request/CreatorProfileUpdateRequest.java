package com.sochen.dto.request;

import jakarta.validation.constraints.Size;

public record CreatorProfileUpdateRequest(
        @Size(max = 1000) String bio,
        @Size(max = 100) String type
) {
}
