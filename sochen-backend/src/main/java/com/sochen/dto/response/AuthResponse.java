package com.sochen.dto.response;

public record AuthResponse(
        UserDTO user,
        String token
) {
}
