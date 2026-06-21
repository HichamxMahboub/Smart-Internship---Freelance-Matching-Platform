package com.smartmatch.security;

import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.exception.ApiException;
import com.smartmatch.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;
import com.smartmatch.model.User;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    private final AuthTokenService authTokenService;
    private final UserRepository userRepository;
    private final HandlerExceptionResolver handlerExceptionResolver;

    @Value("${app.demo-auth.enabled:false}")
    private boolean demoAuthEnabled;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String demoEmail = request.getHeader("X-Demo-User-Email");
            if (demoAuthEnabled && StringUtils.hasText(demoEmail)) {
                userRepository.findByEmail(demoEmail.trim().toLowerCase())
                        .filter(User::isActive)
                        .ifPresent(user -> {
                            SecurityUserPrincipal principal = new SecurityUserPrincipal(user);
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        });
                filterChain.doFilter(request, response);
                return;
            }

            String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                FirebaseToken firebaseToken = authTokenService.verifyAuthorizationHeader(authorizationHeader);
                resolveUser(firebaseToken)
                        .filter(user -> user.isActive())
                        .ifPresent(user -> {
                            SecurityUserPrincipal principal = new SecurityUserPrincipal(user);
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        });
            }
            filterChain.doFilter(request, response);
        } catch (ApiException exception) {
            SecurityContextHolder.clearContext();
            handlerExceptionResolver.resolveException(request, response, null, exception);
        }
    }

    /**
     * Resolves the platform user for a Firebase token. Seed/demo users may have a placeholder
     * firebaseUid until they sign in with the matching email — then the real UID is stored.
     */
    private Optional<User> resolveUser(FirebaseToken firebaseToken) {
        Optional<User> byUid = userRepository.findByFirebaseUid(firebaseToken.getUid());
        if (byUid.isPresent()) {
            return byUid.map(user -> syncVerifiedStatus(user, firebaseToken));
        }
        if (!StringUtils.hasText(firebaseToken.getEmail())) {
            return Optional.empty();
        }
        return userRepository.findByEmail(firebaseToken.getEmail())
                .map(user -> {
                    user.setFirebaseUid(firebaseToken.getUid());
                    return syncVerifiedStatus(user, firebaseToken);
                });
    }

    /** Keep the platform's emailVerified flag in sync with Firebase on every request. */
    private User syncVerifiedStatus(User user, FirebaseToken firebaseToken) {
        boolean fresh = Boolean.TRUE.equals(firebaseToken.isEmailVerified());
        if (user.isEmailVerified() != fresh || user.getFirebaseUid() == null) {
            user.setEmailVerified(fresh);
            return userRepository.save(user);
        }
        return user;
    }
}
