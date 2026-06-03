package com.smartmatch.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smartmatch.config.CloudinaryProperties;
import com.smartmatch.dto.upload.AssetUploadResponse;
import com.smartmatch.dto.upload.UploadSignatureResponse;
import com.smartmatch.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryStorageService {
    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );
    private static final Set<String> RESUME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final Cloudinary cloudinary;
    private final CloudinaryProperties properties;

    public boolean isEnabled() {
        return properties.isConfigured();
    }

    public UploadSignatureResponse signImageUpload() {
        return signUpload(properties.getImageFolder(), "image");
    }

    public UploadSignatureResponse signResumeUpload() {
        return signUpload(properties.getResumeFolder(), "raw");
    }

    public AssetUploadResponse uploadImage(MultipartFile file, String ownerId) {
        requireEnabled();
        validateImage(file);
        return upload(file, properties.getImageFolder(), "image", ownerId);
    }

    public AssetUploadResponse uploadResume(MultipartFile file, String ownerId) {
        requireEnabled();
        validateResume(file);
        return upload(file, properties.getResumeFolder(), "raw", ownerId);
    }

    private UploadSignatureResponse signUpload(String folder, String resourceType) {
        requireEnabled();
        long timestamp = System.currentTimeMillis() / 1000L;
        Map<String, Object> params = new HashMap<>();
        params.put("timestamp", Long.toString(timestamp));
        params.put("folder", folder);
        String signature = cloudinary.apiSignRequest(params, properties.getApiSecret());
        String uploadUrl = "https://api.cloudinary.com/v1_1/" + properties.getCloudName() + "/" + resourceType + "/upload";
        return new UploadSignatureResponse(
                properties.getCloudName(),
                properties.getApiKey(),
                timestamp,
                signature,
                folder,
                resourceType,
                uploadUrl
        );
    }

    @SuppressWarnings("unchecked")
    private AssetUploadResponse upload(MultipartFile file, String folder, String resourceType, String ownerId) {
        String publicId = ownerId + "/" + UUID.randomUUID();
        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType,
                    "public_id", publicId,
                    "overwrite", true
            );
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), options);
            return new AssetUploadResponse(
                    (String) result.get("secure_url"),
                    (String) result.get("public_id"),
                    resourceType,
                    folder
            );
        } catch (IOException exception) {
            throw new BadRequestException("Could not read upload file");
        } catch (Exception exception) {
            throw new BadRequestException("Cloudinary upload failed: " + exception.getMessage());
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Image file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only JPEG, PNG, WEBP and GIF images are accepted");
        }
    }

    private void validateResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !RESUME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only PDF, DOC and DOCX resume files are accepted");
        }
    }

    private void requireEnabled() {
        if (!isEnabled()) {
            throw new BadRequestException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
        }
    }
}
