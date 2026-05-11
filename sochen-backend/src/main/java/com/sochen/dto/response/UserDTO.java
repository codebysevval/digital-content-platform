package com.sochen.dto.response;

import com.sochen.domain.enums.UserRole;

public record UserDTO(
        Long id,
        String name,
        String email,
        String avatarInitials,
        UserRole role,
        String avatarUrl,
        String favoriteCategory
) {
}
