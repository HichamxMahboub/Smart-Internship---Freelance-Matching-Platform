package com.smartmatch.service;

import com.google.firebase.auth.FirebaseToken;
import com.smartmatch.dto.AuthResponse;
import com.smartmatch.dto.SyncUserRequest;
import com.smartmatch.dto.UserResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.mapper.UserMapper;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.security.AuthTokenService;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthTokenService authTokenService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public AuthResponse syncUser(String authorizationHeader, SyncUserRequest request) {
        FirebaseToken firebaseToken = authTokenService.verifyAuthorizationHeader(authorizationHeader);
        String email = firebaseToken.getEmail();
        if (!StringUtils.hasText(email)) {
            throw new BadRequestException("Firebase token must contain an email");
        }

        var existingUser = userRepository.findByFirebaseUid(firebaseToken.getUid());
        boolean created = existingUser.isEmpty();
        User user = existingUser
                .map(currentUser -> updateExistingUser(currentUser, request, firebaseToken))
                .orElseGet(() -> createUser(request, firebaseToken));

        User savedUser = userRepository.save(user);
        return new AuthResponse(userMapper.toResponse(savedUser), created);
    }

    public UserResponse getCurrentUser() {
        return userMapper.toResponse(SecurityUtils.currentUser());
    }

    private User updateExistingUser(User user, SyncUserRequest request, FirebaseToken firebaseToken) {
        user.setFullName(request.fullName());
        user.setEmail(firebaseToken.getEmail());
        user.setEmailVerified(Boolean.TRUE.equals(firebaseToken.isEmailVerified()));
        return user;
    }

    private User createUser(SyncUserRequest request, FirebaseToken firebaseToken) {
        Role role = resolveSelfRegistrationRole(request.role());
        return User.builder()
                .firebaseUid(firebaseToken.getUid())
                .fullName(request.fullName())
                .email(firebaseToken.getEmail())
                .role(role)
                .plan(Plan.FREE)
                .active(true)
                .emailVerified(Boolean.TRUE.equals(firebaseToken.isEmailVerified()))
                .build();
    }

    private Role resolveSelfRegistrationRole(Role requestedRole) {
        if (requestedRole == null) {
            return Role.CANDIDATE;
        }
        if (requestedRole == Role.ADMIN) {
            throw new BadRequestException("ADMIN accounts cannot be created through self-registration");
        }
        return requestedRole;
    }
}
