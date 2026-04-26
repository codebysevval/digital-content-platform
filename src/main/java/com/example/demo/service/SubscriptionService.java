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

    public List<SubscriptionDTO> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream().map(mapper::toSubscriptionDto).toList();
    }

    public SubscriptionDTO getSubscription(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription bulunamadı. id=" + id));
        // TODO: Ödeme entegrasyonu (Payment Gateway) tamamlandığında abonelik doğrulaması ödeme durumuna bağlanacak.
        if (subscription.getEndDate().isBefore(LocalDate.now())) {
            throw new SubscriptionExpiredException("Abonelik süresi dolmuş. id=" + id);
        }
        return mapper.toSubscriptionDto(subscription);
    }
}
