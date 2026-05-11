package com.sochen.dto.response;

public record CreatorApplicationDTO(
        Long id,
        Long userId,
        String username,
        String rationale,
        String status,
        String createdAt
) {
}
