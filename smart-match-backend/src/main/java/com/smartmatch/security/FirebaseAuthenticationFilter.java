package com.smartmatch.security;

import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.exception.ApiException;
import com.smartmatch.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    private final AuthTokenService authTokenService;
    private final UserRepository userRepository;
    private final HandlerExceptionResolver handlerExceptionResolver;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                FirebaseToken firebaseToken = authTokenService.verifyAuthorizationHeader(authorizationHeader);
                userRepository.findByFirebaseUid(firebaseToken.getUid())
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
}
