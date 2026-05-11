package com.sochen.controller;

import com.sochen.dto.request.AddOfflineRequest;
import com.sochen.dto.response.OfflineContentDTO;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.OfflineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/offline")
public class OfflineController {

    private final OfflineService offlineService;
    private final AuthenticationFacade authFacade;

    public OfflineController(OfflineService offlineService,
                             AuthenticationFacade authFacade) {
        this.offlineService = offlineService;
        this.authFacade = authFacade;
    }

    @GetMapping
    public ResponseEntity<List<OfflineContentDTO>> list() {
        return ResponseEntity.ok(offlineService.list(authFacade.currentUserId()));
    }

    @PostMapping
    public ResponseEntity<OfflineContentDTO> add(@Valid @RequestBody AddOfflineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(offlineService.add(authFacade.currentUserId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        offlineService.delete(authFacade.currentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
