package com.smartmatch.exception;

import org.springframework.http.HttpStatus;

public class FirebaseConfigurationException extends ApiException {
    public FirebaseConfigurationException(String message) {
        super(HttpStatus.SERVICE_UNAVAILABLE, message);
    }
}
