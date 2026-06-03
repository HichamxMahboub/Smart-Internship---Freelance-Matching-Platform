package com.smartmatch.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "smartmatch.cloudinary")
public class CloudinaryProperties {
    private String cloudName = "";
    private String apiKey = "";
    private String apiSecret = "";
    private String imageFolder = "interlance/images";
    private String resumeFolder = "interlance/resumes";

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }
}
