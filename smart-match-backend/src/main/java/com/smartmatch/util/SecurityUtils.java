package com.smartmatch.util;

import com.smartmatch.exception.UnauthorizedException;
import com.smartmatch.model.User;
import com.smartmatch.security.SecurityUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {
    }

    public static User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUserPrincipal principal)) {
            throw new UnauthorizedException("Authenticated user not found");
        }
        return principal.getUser();
    }
}
