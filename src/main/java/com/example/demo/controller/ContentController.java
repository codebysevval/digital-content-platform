package com.example.demo.controller;

import com.example.demo.dto.ContentDTO;
import com.example.demo.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping
    public List<ContentDTO> getAllContents() {
        return contentService.getAllContents();
    }

    @GetMapping("/{id}")
    public ContentDTO getContentById(@PathVariable Long id) {
        return contentService.getContentById(id);
    }
}
