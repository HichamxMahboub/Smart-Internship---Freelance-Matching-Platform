package com.smartmatch.security;

import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.exception.FirebaseConfigurationException;

public class DisabledFirebaseTokenVerifier implements FirebaseTokenVerifier {
    @Override
    public FirebaseToken verify(String idToken) {
        throw new FirebaseConfigurationException("Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.");
    }
}
