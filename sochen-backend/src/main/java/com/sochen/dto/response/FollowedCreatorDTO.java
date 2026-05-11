package com.sochen.dto.response;

public record FollowedCreatorDTO(
        Long id,
        String name,
        String avatar,
        String followers
) {
}
