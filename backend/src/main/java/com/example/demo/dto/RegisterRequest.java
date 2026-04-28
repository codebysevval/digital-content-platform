package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Kullanıcı adı zorunludur.")
    private String username;
    @NotBlank(message = "Şifre zorunludur.")
    private String password;
    @Email(message = "Geçerli bir e-posta giriniz.")
    @NotBlank(message = "E-posta zorunludur.")
    private String email;
    @NotBlank(message = "Ad soyad zorunludur.")
    private String fullName;
}
