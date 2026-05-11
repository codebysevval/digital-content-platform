package com.sochen.repository;

import com.sochen.domain.WeeklyDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeeklyDeliveryRepository extends JpaRepository<WeeklyDelivery, Long> {
    List<WeeklyDelivery> findAllByOrderByDayOfWeekAsc();
}
