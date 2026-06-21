package com.smartmatch.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    private static final String FIREBASE_BEARER_AUTH = "firebaseBearerAuth";

    @Bean
    public OpenAPI smartMatchOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Interlance API")
                        .version("1.0.0")
                        .description("Backend REST API for a mobile and backoffice platform connecting candidates with recruiters."))
                .components(new Components()
                        .addSecuritySchemes(FIREBASE_BEARER_AUTH, new SecurityScheme()
                                .name(FIREBASE_BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("Firebase JWT")
                                .description("Paste a Firebase ID token. The backend expects Authorization: Bearer <firebase_token>.")))
                .addSecurityItem(new SecurityRequirement().addList(FIREBASE_BEARER_AUTH));
    }
}
