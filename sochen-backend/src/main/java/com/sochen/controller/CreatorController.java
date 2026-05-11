package com.sochen.controller;

import com.sochen.dto.response.CreatorContentDTO;
import com.sochen.dto.response.CreatorDTO;
import com.sochen.dto.response.CreatorSearchResultDTO;
import com.sochen.dto.response.FollowToggleResponse;
import com.sochen.dto.response.NotificationToggleResponse;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.CreatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/creators")
public class CreatorController {

    private final CreatorService creatorService;
    private final AuthenticationFacade authFacade;

    public CreatorController(CreatorService creatorService,
                             AuthenticationFacade authFacade) {
        this.creatorService = creatorService;
        this.authFacade = authFacade;
    }

    @GetMapping("/search")
    public ResponseEntity<List<CreatorSearchResultDTO>> search(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(creatorService.searchCreators(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreatorDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(creatorService.getById(id));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<List<CreatorContentDTO>> content(@PathVariable Long id) {
        return ResponseEntity.ok(creatorService.listCreatorContent(id));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<FollowToggleResponse> follow(@PathVariable Long id) {
        return ResponseEntity.ok(creatorService.toggleFollow(authFacade.currentUserId(), id));
    }

    @PostMapping("/{id}/notifications")
    public ResponseEntity<NotificationToggleResponse> notifications(@PathVariable Long id) {
        return ResponseEntity.ok(creatorService.toggleNotifications(authFacade.currentUserId(), id));
    }
}
