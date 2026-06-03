package com.smartmatch.service;

import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.dto.SyncUserRequest;
import com.smartmatch.dto.UserResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.mapper.UserMapper;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.security.AuthTokenService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Constructor;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock
    private AuthTokenService authTokenService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    @Test
    void syncUserRejectsAdminRoleOnCreation() {
        FirebaseToken token = firebaseToken("uid-admin", "admin@example.com");
        when(authTokenService.verifyAuthorizationHeader("Bearer token")).thenReturn(token);
        when(userRepository.findByFirebaseUid("uid-admin")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.syncUser("Bearer token", new SyncUserRequest("Admin", Role.ADMIN)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("ADMIN accounts cannot be created");
        verify(userRepository, never()).save(any());
    }

    @Test
    void syncUserCreatesCandidate() {
        User saved = createUser(Role.CANDIDATE);
        when(authTokenService.verifyAuthorizationHeader("Bearer token")).thenReturn(firebaseToken("uid-candidate", "candidate@example.com"));
        when(userRepository.findByFirebaseUid("uid-candidate")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.toResponse(saved)).thenReturn(userResponse(saved));

        authService.syncUser("Bearer token", new SyncUserRequest("Candidate", Role.CANDIDATE));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.CANDIDATE);
        assertThat(captor.getValue().getPlan()).isEqualTo(Plan.FREE);
    }

    @Test
    void syncUserCreatesRecruiter() {
        User saved = createUser(Role.RECRUITER);
        when(authTokenService.verifyAuthorizationHeader("Bearer token")).thenReturn(firebaseToken("uid-recruiter", "recruiter@example.com"));
        when(userRepository.findByFirebaseUid("uid-recruiter")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.toResponse(saved)).thenReturn(userResponse(saved));

        authService.syncUser("Bearer token", new SyncUserRequest("Recruiter", Role.RECRUITER));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.RECRUITER);
    }

    private FirebaseToken firebaseToken(String uid, String email) {
        try {
            Constructor<FirebaseToken> constructor = FirebaseToken.class.getDeclaredConstructor(Map.class);
            constructor.setAccessible(true);
            return constructor.newInstance(Map.of(
                    "sub", uid,
                    "email", email,
                    "email_verified", true
            ));
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("Could not create FirebaseToken test fixture", exception);
        }
    }

    private User createUser(Role role) {
        return User.builder()
                .id("user-1")
                .firebaseUid("uid")
                .fullName("User")
                .email("user@example.com")
                .role(role)
                .plan(Plan.FREE)
                .active(true)
                .emailVerified(true)
                .build();
    }

    private UserResponse userResponse(User user) {
        return new UserResponse(user.getId(), user.getFirebaseUid(), user.getFullName(), user.getEmail(),
                user.getRole(), user.getPlan(), user.isActive(), user.isEmailVerified(), null, null);
    }
}
