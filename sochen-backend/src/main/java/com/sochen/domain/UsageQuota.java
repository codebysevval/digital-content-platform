package com.sochen.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usage_quotas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "api_calls_used", nullable = false)
    private Integer apiCallsUsed;

    @Column(name = "api_calls_limit", nullable = false)
    private Integer apiCallsLimit;

    @Column(name = "storage_used_gb", nullable = false)
    private Integer storageUsedGb;

    @Column(name = "storage_limit_gb", nullable = false)
    private Integer storageLimitGb;

    @Column(name = "team_members_used", nullable = false)
    private Integer teamMembersUsed;

    @Column(name = "team_members_limit", nullable = false)
    private Integer teamMembersLimit;
}
