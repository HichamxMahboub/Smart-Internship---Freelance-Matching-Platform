package com.smartmatch.security;

import com.google.firebase.auth.FirebaseToken;

public interface FirebaseTokenVerifier {
    FirebaseToken verify(String idToken);
}
