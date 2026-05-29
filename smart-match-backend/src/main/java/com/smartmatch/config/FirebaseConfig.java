package com.smartmatch.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.smartmatch.security.DisabledFirebaseTokenVerifier;
import com.smartmatch.security.FirebaseAdminTokenVerifier;
import com.smartmatch.security.FirebaseTokenVerifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableConfigurationProperties(FirebaseProperties.class)
public class FirebaseConfig {

    @Bean
    public FirebaseTokenVerifier firebaseTokenVerifier(FirebaseProperties properties) throws IOException {
        FirebaseAuth firebaseAuth = initializeFirebaseAuth(properties);
        if (firebaseAuth == null) {
            return new DisabledFirebaseTokenVerifier();
        }
        return new FirebaseAdminTokenVerifier(firebaseAuth);
    }

    private FirebaseAuth initializeFirebaseAuth(FirebaseProperties properties) throws IOException {
        if (!StringUtils.hasText(properties.serviceAccountPath()) && !StringUtils.hasText(properties.serviceAccountJson())) {
            return null;
        }

        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials = loadCredentials(properties);
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();
            FirebaseApp.initializeApp(options);
        }

        return FirebaseAuth.getInstance();
    }

    private GoogleCredentials loadCredentials(FirebaseProperties properties) throws IOException {
        if (StringUtils.hasText(properties.serviceAccountJson())) {
            byte[] json = properties.serviceAccountJson().getBytes(StandardCharsets.UTF_8);
            return GoogleCredentials.fromStream(new ByteArrayInputStream(json));
        }
        return GoogleCredentials.fromStream(new FileInputStream(properties.serviceAccountPath()));
    }
}
