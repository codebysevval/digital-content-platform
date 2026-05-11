package com.sochen.controller;

import com.sochen.dto.request.ApplicationRejectionRequest;
import com.sochen.dto.request.CreatorApplicationRequest;
import com.sochen.dto.response.CreatorApplicationDTO;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.CreatorApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CreatorApplicationController {

    private final CreatorApplicationService applicationService;
    private final AuthenticationFacade authFacade;

    public CreatorApplicationController(CreatorApplicationService applicationService,
                                        AuthenticationFacade authFacade) {
        this.applicationService = applicationService;
        this.authFacade = authFacade;
    }

    /** Authenticated user submits a creator application. */
    @PostMapping("/api/creator-applications")
    public ResponseEntity<CreatorApplicationDTO> apply(@Valid @RequestBody CreatorApplicationRequest request) {
        CreatorApplicationDTO dto = applicationService.apply(authFacade.currentUserId(), request.rationale());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /** Returns the calling user's latest application, or 204 if none exists. */
    @GetMapping("/api/creator-applications/me")
    public ResponseEntity<CreatorApplicationDTO> myApplication() {
        return applicationService.getMyApplication(authFacade.currentUserId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /** Admin: list all PENDING applications. */
    @GetMapping("/api/admin/creator-applications")
    public ResponseEntity<List<CreatorApplicationDTO>> listPending() {
        return ResponseEntity.ok(applicationService.getPendingApplications());
    }

    /** Admin: approve an application — promotes user to CREATOR and creates Creator record. */
    @PostMapping("/api/admin/creator-applications/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long id) {
        applicationService.approve(id);
        return ResponseEntity.noContent().build();
    }

    /** Admin: reject an application with a required reason. */
    @PostMapping("/api/admin/creator-applications/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long id,
                                       @Valid @RequestBody ApplicationRejectionRequest request) {
        applicationService.reject(id, request.reason());
        return ResponseEntity.noContent().build();
    }
}
