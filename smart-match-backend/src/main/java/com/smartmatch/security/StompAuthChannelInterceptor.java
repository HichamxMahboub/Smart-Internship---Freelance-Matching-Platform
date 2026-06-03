package com.smartmatch.security;

import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.exception.UnauthorizedException;
import com.smartmatch.model.User;
import com.smartmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Authenticates STOMP CONNECT frames using the Firebase ID token carried in the
 * {@code Authorization} header. The authenticated principal name is the MongoDB user id,
 * so messages can be routed with {@code convertAndSendToUser(userId, ...)}.
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    private final AuthTokenService authTokenService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
            FirebaseToken firebaseToken = authTokenService.verifyAuthorizationHeader(authorizationHeader);
            User user = userRepository.findByFirebaseUid(firebaseToken.getUid())
                    .filter(User::isActive)
                    .orElseThrow(() -> new UnauthorizedException("Authenticated user not found or inactive"));
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user.getId(), null, List.of());
            accessor.setUser(authentication);
        }
        return message;
    }
}
