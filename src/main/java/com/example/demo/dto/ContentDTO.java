package com.example.demo.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ContentDTO(
        Long id,
        String title,
        String category,
        boolean premium,
        List<Long> userIds
) {
}
