package com.sochen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SystemModuleStatus {
    ONLINE,
    DEGRADED;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static SystemModuleStatus fromJson(String value) {
        if (value == null) {
            return null;
        }
        return SystemModuleStatus.valueOf(value.trim().toUpperCase());
    }
}
