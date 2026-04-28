package com.example.demo.controller;

import com.example.demo.dto.SubscriptionDTO;
import com.example.demo.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * Figma dashboard abonelik paketleri tablosunu beslemek için tüm abonelikleri döner.
     */
    @GetMapping
    public List<SubscriptionDTO> getAllSubscriptions() {
        return subscriptionService.getAllSubscriptions();
    }

    /**
     * Figma abonelik detay kartında seçilen paketi döner.
     */
    @GetMapping("/{id}")
    public SubscriptionDTO getSubscription(@PathVariable Long id) {
        return subscriptionService.getSubscription(id);
    }
}
