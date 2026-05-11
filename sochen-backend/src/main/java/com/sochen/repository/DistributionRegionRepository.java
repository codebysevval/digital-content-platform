package com.sochen.repository;

import com.sochen.domain.DistributionRegion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DistributionRegionRepository extends JpaRepository<DistributionRegion, Long> {
    List<DistributionRegion> findAllByOrderByIdAsc();
}
