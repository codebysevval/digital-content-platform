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
@Table(name = "marketing_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketingPlan {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "icon_key", nullable = false)
    private String iconKey;

    @Column(name = "monthly_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyPrice;

    @Column(name = "yearly_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal yearlyPrice;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String features;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private boolean recommended;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
