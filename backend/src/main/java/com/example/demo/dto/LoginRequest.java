package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {
    /**
     * Frontend ile tam uyumluluk için girişte e-posta alanı da desteklenir.
     */
    private String email;

    private String username;

    @NotBlank(message = "Şifre zorunludur.")
    private String password;
}