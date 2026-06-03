package com.smartmatch.dto.upload;

public record AssetUploadResponse(
        String url,
        String publicId,
        String resourceType,
        String folder
) {
}
