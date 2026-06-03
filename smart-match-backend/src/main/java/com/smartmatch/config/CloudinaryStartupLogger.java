package com.smartmatch.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CloudinaryStartupLogger {
    private final CloudinaryProperties properties;

    @EventListener(ApplicationReadyEvent.class)
    public void logStatus() {
        if (properties.isConfigured()) {
            log.info("Cloudinary enabled — images: {}, resumes: {}",
                    properties.getImageFolder(), properties.getResumeFolder());
        } else {
            log.warn("Cloudinary not configured (set CLOUDINARY_CLOUD_NAME). File uploads use local disk fallback for CVs only.");
        }
    }
}
