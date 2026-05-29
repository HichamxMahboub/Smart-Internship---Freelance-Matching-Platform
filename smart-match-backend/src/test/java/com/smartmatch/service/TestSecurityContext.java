package com.smartmatch.service;

import com.smartmatch.model.User;
import com.smartmatch.security.SecurityUserPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

final class TestSecurityContext {
    private TestSecurityContext() {
    }

    static void setCurrentUser(User user) {
        SecurityUserPrincipal principal = new SecurityUserPrincipal(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    static void clear() {
        SecurityContextHolder.clearContext();
    }
}
