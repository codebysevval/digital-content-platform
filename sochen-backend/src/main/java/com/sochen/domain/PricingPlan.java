package com.sochen.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "pricing_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingPlan {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "icon_key", nullable = false)
    private String iconKey;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String period;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String features;

    @Column(nullable = false)
    private String color;

    @Column(name = "is_free", nullable = false)
    private boolean isFree;

    @Column(nullable = false)
    private boolean recommended;

    @Column
    private String savings;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
