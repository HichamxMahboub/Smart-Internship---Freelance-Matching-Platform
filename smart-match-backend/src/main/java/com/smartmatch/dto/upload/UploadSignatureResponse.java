package com.smartmatch.dto.upload;

public record UploadSignatureResponse(
        String cloudName,
        String apiKey,
        long timestamp,
        String signature,
        String folder,
        String resourceType,
        String uploadUrl
) {
}
