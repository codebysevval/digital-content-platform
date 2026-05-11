package com.sochen.dto.response;

import com.sochen.domain.enums.SystemModuleStatus;

public record SystemModuleDTO(
        String name,
        SystemModuleStatus status,
        String uptime,
        String requests
) {
}
