package com.smartmatch.controller;

import com.smartmatch.dto.upload.AssetUploadResponse;
import com.smartmatch.dto.upload.UploadSignatureResponse;
import com.smartmatch.service.CloudinaryStorageService;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {
    private final CloudinaryStorageService cloudinaryStorageService;

    @GetMapping("/sign-image")
    public ResponseEntity<UploadSignatureResponse> signImage() {
        return ResponseEntity.ok(cloudinaryStorageService.signImageUpload());
    }

    @GetMapping("/sign-resume")
    public ResponseEntity<UploadSignatureResponse> signResume() {
        return ResponseEntity.ok(cloudinaryStorageService.signResumeUpload());
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        String userId = SecurityUtils.currentUser().getId();
        return ResponseEntity.ok(cloudinaryStorageService.uploadImage(file, userId));
    }

    @PostMapping(value = "/resumes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetUploadResponse> uploadResume(@RequestParam("file") MultipartFile file) {
        String userId = SecurityUtils.currentUser().getId();
        return ResponseEntity.ok(cloudinaryStorageService.uploadResume(file, userId));
    }
}
