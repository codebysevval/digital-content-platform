package com.sochen.controller;

import com.sochen.dto.request.PaymentRequest;
import com.sochen.dto.response.PaymentResponse;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthenticationFacade authFacade;

    public PaymentController(PaymentService paymentService,
                             AuthenticationFacade authFacade) {
        this.paymentService = paymentService;
        this.authFacade = authFacade;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> submit(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.process(authFacade.currentUserId(), request));
    }
}
