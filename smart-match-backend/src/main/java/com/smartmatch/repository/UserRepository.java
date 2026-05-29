package com.smartmatch.repository;

import com.smartmatch.model.User;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByFirebaseUid(String firebaseUid);
    Optional<User> findByEmail(String email);
    long countByRole(Role role);
    long countByPlan(Plan plan);
}
