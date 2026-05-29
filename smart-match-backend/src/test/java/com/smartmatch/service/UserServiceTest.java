package com.smartmatch.service;

import com.smartmatch.dto.user.UserUpdateRequest;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @AfterEach
    void tearDown() {
        TestSecurityContext.clear();
    }

    @Test
    void updateCurrentUserDoesNotChangeRole() {
        User user = User.builder()
                .id("user-1")
                .firebaseUid("uid-1")
                .fullName("Old Name")
                .email("user@example.com")
                .role(Role.CANDIDATE)
                .plan(Plan.FREE)
                .active(true)
                .emailVerified(true)
                .build();
        TestSecurityContext.setCurrentUser(user);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = userService.updateCurrentUser(new UserUpdateRequest("New Name"));

        assertThat(response.fullName()).isEqualTo("New Name");
        assertThat(response.role()).isEqualTo(Role.CANDIDATE);
    }
}
