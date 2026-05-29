package com.smartmatch.security;

import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthTokenService {
    private static final String BEARER_PREFIX = "Bearer ";

    private final FirebaseTokenVerifier firebaseTokenVerifier;

    public FirebaseToken verifyAuthorizationHeader(String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new UnauthorizedException("Missing Authorization bearer token");
        }
        return firebaseTokenVerifier.verify(authorizationHeader.substring(BEARER_PREFIX.length()).trim());
    }
}
