package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CheckoutPlanDTO(
        String id,
        String name,
        BigDecimal price,
        String period,
        Boolean popular,
        String savings,
        List<String> features
) {
}
