package com.sochen.dto.response;

public record FollowToggleResponse(
        boolean following,
        long followerCount
) {
}
