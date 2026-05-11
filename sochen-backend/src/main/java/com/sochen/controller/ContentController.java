package com.sochen.controller;

import com.sochen.domain.enums.ContentCategory;
import com.sochen.dto.response.ContentDTO;
import com.sochen.dto.response.ContentDetailDTO;
import com.sochen.dto.response.ContentTypeOptionDTO;
import com.sochen.dto.response.LikeToggleResponse;
import com.sochen.dto.response.RelatedContentDTO;
import com.sochen.dto.response.TopicDTO;
import com.sochen.security.AuthenticationFacade;
import com.sochen.service.ContentService;
import com.sochen.service.HeartbeatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final ContentService contentService;
    private final HeartbeatService heartbeatService;
    private final AuthenticationFacade authFacade;

    public ContentController(ContentService contentService,
                             HeartbeatService heartbeatService,
                             AuthenticationFacade authFacade) {
        this.contentService = contentService;
        this.heartbeatService = heartbeatService;
        this.authFacade = authFacade;
    }

    // Spring MVC matches literal segments before path variables, so listing
    // /search /topics /types ahead of /{id} would not strictly be required —
    // but keeping them at the top of the file makes the resolution order
    // obvious to future readers.

    @GetMapping
    public ResponseEntity<List<ContentDTO>> list() {
        return ResponseEntity.ok(contentService.listAll());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicDTO>> topics() {
        return ResponseEntity.ok(contentService.listTopics());
    }

    @GetMapping("/types")
    public ResponseEntity<List<ContentTypeOptionDTO>> types() {
        return ResponseEntity.ok(contentService.listContentTypes());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ContentDTO>> search(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String searchQuery,
            @RequestParam(required = false, defaultValue = "false") boolean showSubscriberOnly,
            @RequestParam(required = false, defaultValue = "true") boolean showFreeContent,
            @RequestParam(required = false) String selectedContentTypes,
            @RequestParam(required = false, defaultValue = "newest") String sortBy) {

        List<ContentCategory> selected = parseSelectedTypes(selectedContentTypes);
        return ResponseEntity.ok(contentService.search(
                category,
                topic,
                searchQuery,
                showSubscriberOnly,
                showFreeContent,
                selected,
                sortBy
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentDetailDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getById(id));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<RelatedContentDTO>> related(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getRelated(id));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<LikeToggleResponse> like(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.toggleLike(authFacade.currentUserId(), id));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ContentDTO>> trending() {
        return ResponseEntity.ok(contentService.getTrending());
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<ContentDTO>> recommended(
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(contentService.getRecommended(category));
    }

    @GetMapping("/following-feed")
    public ResponseEntity<List<ContentDTO>> followingFeed() {
        return ResponseEntity.ok(contentService.getFollowingFeed(authFacade.currentUserId()));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordView(@PathVariable Long id) {
        contentService.recordView(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{id}/heartbeat")
    public ResponseEntity<Void> recordHeartbeat(@PathVariable Long id) {
        heartbeatService.recordHeartbeat(authFacade.currentUserId(), id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    private List<ContentCategory> parseSelectedTypes(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> ContentCategory.valueOf(s.toUpperCase(Locale.ROOT)))
                .toList();
    }
}
