package com.sochen.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record YearlyTogglePlanDTO(
        String name,
        String iconKey,
        BigDecimal monthlyPrice,
        BigDecimal yearlyPrice,
        String description,
        List<String> features,
        String color,
        Boolean recommended
) {
}
