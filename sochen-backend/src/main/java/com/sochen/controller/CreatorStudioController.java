package com.sochen.controller;

import com.sochen.dto.request.ContentUpdateRequest;
import com.sochen.dto.request.NewContentRequest;
import com.sochen.dto.response.CreatedIdResponse;
import com.sochen.dto.response.CreatorContentDTO;
import com.sochen.dto.response.CreatorFollowerDTO;
import com.sochen.dto.response.CreatorStudioStatsDTO;
import com.sochen.dto.response.EarningsHistoryEntryDTO;
import com.sochen.dto.response.UploadResponse;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.CreatorStudioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/creator-studio")
public class CreatorStudioController {

    private final CreatorStudioService creatorStudioService;
    private final AuthenticationFacade authFacade;

    public CreatorStudioController(CreatorStudioService creatorStudioService,
                                   AuthenticationFacade authFacade) {
        this.creatorStudioService = creatorStudioService;
        this.authFacade = authFacade;
    }

    @GetMapping("/stats")
    public ResponseEntity<CreatorStudioStatsDTO> stats() {
        return ResponseEntity.ok(creatorStudioService.getStats(authFacade.currentUser()));
    }

    @GetMapping("/earnings-history")
    public ResponseEntity<List<EarningsHistoryEntryDTO>> earningsHistory() {
        return ResponseEntity.ok(
                creatorStudioService.getEarningsHistory(authFacade.currentUser().getId()));
    }

    @GetMapping("/my-content")
    public ResponseEntity<List<CreatorContentDTO>> myContent() {
        return ResponseEntity.ok(
                creatorStudioService.getMyContent(authFacade.currentUser().getId()));
    }

    @PostMapping("/content")
    public ResponseEntity<CreatedIdResponse> publish(@Valid @RequestBody NewContentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(creatorStudioService.publish(authFacade.currentUser(), request));
    }

    @PutMapping("/content/{id}")
    public ResponseEntity<CreatorContentDTO> updateContent(
            @PathVariable Long id,
            @Valid @RequestBody ContentUpdateRequest request) {
        return ResponseEntity.ok(
                creatorStudioService.updateContent(authFacade.currentUser().getId(), id, request));
    }

    @DeleteMapping("/content/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable Long id) {
        creatorStudioService.deleteContent(authFacade.currentUser().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/followers")
    public ResponseEntity<List<CreatorFollowerDTO>> followers() {
        return ResponseEntity.ok(
                creatorStudioService.getFollowers(authFacade.currentUser().getId()));
    }

    @PostMapping(value = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(creatorStudioService.storeUpload(file));
    }
}
