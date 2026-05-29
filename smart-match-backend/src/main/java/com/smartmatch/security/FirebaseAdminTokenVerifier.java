package com.smartmatch.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class FirebaseAdminTokenVerifier implements FirebaseTokenVerifier {
    private final FirebaseAuth firebaseAuth;

    @Override
    public FirebaseToken verify(String idToken) {
        try {
            return firebaseAuth.verifyIdToken(idToken, true);
        } catch (FirebaseAuthException exception) {
            throw new UnauthorizedException("Invalid Firebase ID token");
        }
    }
}
