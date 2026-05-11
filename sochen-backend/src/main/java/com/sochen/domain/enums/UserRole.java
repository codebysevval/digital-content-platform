package com.sochen.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    USER,
    CREATOR,
    ADMIN;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static UserRole fromJson(String value) {
        if (value == null) {
            return null;
        }
        return UserRole.valueOf(value.trim().toUpperCase());
    }
}
