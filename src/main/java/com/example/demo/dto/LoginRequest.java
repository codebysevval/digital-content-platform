package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Kullanıcı adı zorunludur.")
    private String username;
    @NotBlank(message = "Şifre zorunludur.")
    private String password;
}