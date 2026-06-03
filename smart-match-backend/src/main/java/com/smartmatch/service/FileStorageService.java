package com.smartmatch.service;

import com.smartmatch.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    private static final long MAX_CV_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".pdf", ".doc", ".docx");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    @Value("${smartmatch.upload.cv-dir:/uploads/cv}")
    private String cvUploadDir;

    public String storeCv(MultipartFile file, String userId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CV file is required");
        }
        if (file.getSize() > MAX_CV_BYTES) {
            throw new BadRequestException("CV file must not exceed 5MB");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only PDF, DOC and DOCX CV files are accepted");
        }

        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename) || originalFilename.contains("..")
                || originalFilename.contains("/") || originalFilename.contains("\\")) {
            throw new BadRequestException("Invalid CV filename");
        }

        String cleanFilename = StringUtils.cleanPath(originalFilename);
        String extension = "";
        int extensionIndex = cleanFilename.lastIndexOf('.');
        if (extensionIndex >= 0) {
            extension = cleanFilename.substring(extensionIndex).toLowerCase(Locale.ROOT);
        }
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Only PDF, DOC and DOCX CV files are accepted");
        }

        String storedFilename = "cv-" + UUID.randomUUID() + extension;
        Path directory = Path.of(cvUploadDir).toAbsolutePath().normalize();
        Path destination = directory.resolve(storedFilename).normalize();
        if (!destination.startsWith(directory)) {
            throw new BadRequestException("Invalid CV storage path");
        }

        try {
            Files.createDirectories(directory);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BadRequestException("Could not store CV file");
        }

        return "/uploads/cv/" + storedFilename;
    }
}
