package com.example.demo.dto;
/**
 * Login/Register ekranlarında istemcinin oturum kurması için dönen JWT cevabıdır.
 */
public record AuthResponse(
        String token,
        String tokenType,
        UserSessionDTO user
) {
}
