package com.example.demo.dto;

/**
 * Mobil/Frontend tarafında oturum bilgisini taşımak için kullanılan kullanıcı özeti.
 */
public record UserSessionDTO(
        Long id,
        String username,
        String email,
        String fullName,
        String role
) {
}
