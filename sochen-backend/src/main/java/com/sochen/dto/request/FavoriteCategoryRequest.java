package com.sochen.dto.request;

import jakarta.validation.constraints.NotBlank;

public record FavoriteCategoryRequest(@NotBlank String category) {
}
