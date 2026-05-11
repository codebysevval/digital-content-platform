package com.sochen.repository;

import com.sochen.domain.BillingRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long> {
    List<BillingRecord> findAllByUserIdOrderByBillingDateDesc(Long userId);
}
