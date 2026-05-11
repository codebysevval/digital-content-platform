package com.sochen.service;

import com.sochen.domain.Payment;
import com.sochen.domain.Subscription;
import com.sochen.dto.request.PaymentRequest;
import com.sochen.dto.response.PaymentResponse;
import com.sochen.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SubscriptionService subscriptionService;

    public PaymentService(PaymentRepository paymentRepository,
                          SubscriptionService subscriptionService) {
        this.paymentRepository = paymentRepository;
        this.subscriptionService = subscriptionService;
    }

    /**
     * Persists a payment intent and activates the requested plan. Card data
     * (number, CVV) is intentionally never logged or persisted — only the
     * planId, cardholderName and resolved amount are stored.
     */
    @Transactional
    public PaymentResponse process(Long userId, PaymentRequest request) {
        SubscriptionService.ResolvedPlan plan = subscriptionService.resolvePlan(request.planId());
        Subscription subscription = subscriptionService.activatePlan(userId, request.planId());

        paymentRepository.save(Payment.builder()
                .userId(userId)
                .planId(request.planId())
                .cardholderName(request.cardholderName())
                .amount(plan.price())
                .success(true)
                .createdAt(OffsetDateTime.now())
                .build());

        return new PaymentResponse(true, subscriptionService.toStatusDto(subscription));
    }
}
