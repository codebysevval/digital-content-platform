package com.sochen.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "managed_user_views",
        indexes = @Index(name = "idx_managed_user_views_context", columnList = "context"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagedUserView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String context;

    @Column(name = "external_user_id", nullable = false)
    private Long externalUserId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String tier;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal mrr;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
