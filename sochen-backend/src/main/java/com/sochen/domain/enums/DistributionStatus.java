package com.sochen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DistributionStatus {
    AKTIF("Aktif"),
    BEKLEMEDE("Beklemede");

    private final String label;

    DistributionStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String toJson() {
        return label;
    }

    @JsonCreator
    public static DistributionStatus fromJson(String value) {
        if (value == null) {
            return null;
        }
        for (DistributionStatus status : values()) {
            if (status.label.equalsIgnoreCase(value.trim())
                || status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown DistributionStatus: " + value);
    }
}
