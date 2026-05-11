package com.sochen.dto.response;

public record CreatorSearchResultDTO(
        Long id,
        String name,
        String avatar,
        String type,
        Long followers,
        String avatarUrl
) {
}
