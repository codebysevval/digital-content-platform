package com.sochen.repository;

import com.sochen.domain.MonthlyMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MonthlyMetricRepository extends JpaRepository<MonthlyMetric, Long> {
    List<MonthlyMetric> findAllByOrderByMonthIndexAsc();
}
