package com.sochen.dto.response;

public record CreatorDTO(
        Long id,
        String name,
        String avatar,
        String type,
        String bio,
        Long followers,
        Integer totalContent,
        Long totalViews
) {
}
