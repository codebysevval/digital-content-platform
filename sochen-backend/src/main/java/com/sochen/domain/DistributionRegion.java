package com.sochen.domain;

import com.sochen.domain.enums.DistributionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "distribution_regions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DistributionRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String region;

    @Column(name = "distribution_points", nullable = false)
    private String distributionPoints;

    @Column(name = "monthly_amount", nullable = false)
    private String monthlyAmount;

    @Column(name = "last_delivery", nullable = false)
    private LocalDate lastDelivery;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DistributionStatus status;
}
