package com.sochen.dto.response;

public record UsageQuotaDTO(
        Integer apiCallsUsed,
        Integer apiCallsLimit,
        Integer storageUsedGb,
        Integer storageLimitGb,
        Integer teamMembersUsed,
        Integer teamMembersLimit
) {
}
