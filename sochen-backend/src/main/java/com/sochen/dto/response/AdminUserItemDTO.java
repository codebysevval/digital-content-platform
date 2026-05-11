package com.sochen.dto.response;

public record AdminUserItemDTO(
        Long id,
        String name,
        String email,
        String role,
        boolean hasSubscription
) {
}
