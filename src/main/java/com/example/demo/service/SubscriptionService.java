package com.example.demo.service;

import com.example.demo.dto.SubscriptionDTO;
import com.example.demo.entity.Subscription;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.SubscriptionExpiredException;
import com.example.demo.mapper.DtoMapper;
import com.example.demo.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final DtoMapper mapper;

    /**
     * Figma dashboard abonelik listesi için tüm abonelik DTO'larını döner.
     */
    public List<SubscriptionDTO> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream().map(mapper::toSubscriptionDto).toList();
    }

    /**
     * Figma abonelik detay ekranı için tek aboneliği getirir ve aktiflik kontrolü yapar.
     */
    public SubscriptionDTO getSubscription(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription bulunamadı. id=" + id));
        if (subscription.getEndDate().isBefore(LocalDate.now())) {
            throw new SubscriptionExpiredException("Abonelik süresi dolmuş. id=" + id);
        }
        return mapper.toSubscriptionDto(subscription);
    }
}
