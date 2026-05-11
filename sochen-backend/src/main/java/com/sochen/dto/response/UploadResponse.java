package com.sochen.dto.response;

public record UploadResponse(
        String uploadId,
        String url,
        Integer pageCount
) {
}
