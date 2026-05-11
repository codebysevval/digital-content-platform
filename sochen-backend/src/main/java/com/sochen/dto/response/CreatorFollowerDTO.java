package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.OffsetDateTime;

public record CreatorFollowerDTO(
        Long userId,
        String name,
        String avatarUrl,
        String avatarInitials,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
        OffsetDateTime followedAt
) {
}
