package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PricingPlanDTO(
        String id,
        String name,
        String iconKey,
        BigDecimal price,
        String period,
        String description,
        List<String> features,
        String color,
        Boolean isFree,
        Boolean recommended,
        String savings
) {
}
