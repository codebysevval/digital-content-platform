package com.sochen.dto.response;

import java.math.BigDecimal;

public record ManagedUserDTO(
        Long id,
        String name,
        String email,
        String tier,
        String status,
        BigDecimal mrr
) {
}
