package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Figma dashboard yönetici panelindeki içerik kartı ekleme formunun request modelidir.
 */
@Getter
@Setter
@NoArgsConstructor
public class ContentUpsertRequest {
    @NotBlank(message = "İçerik başlığı zorunludur.")
    private String title;

    @NotBlank(message = "Kategori zorunludur.")
    private String category;

    @NotBlank(message = "Kapak görseli URL'i zorunludur.")
    private String thumbnailUrl;

    @NotNull(message = "Süre bilgisi zorunludur.")
    private Integer durationMinutes;

    private boolean premium;
}
