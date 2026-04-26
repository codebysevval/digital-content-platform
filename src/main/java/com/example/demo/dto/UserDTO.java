package com.example.demo.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record UserDTO(
        Long id,
        String username,
        String email,
        String fullName,
        String role,
        List<Long> subscriptionIds,
        List<Long> contentIds
) {
}
