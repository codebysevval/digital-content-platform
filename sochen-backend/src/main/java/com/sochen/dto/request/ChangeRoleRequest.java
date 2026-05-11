package com.sochen.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ChangeRoleRequest(@NotBlank String role) {
}
