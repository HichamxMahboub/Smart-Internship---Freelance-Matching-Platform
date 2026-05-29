package com.smartmatch.repository;

import com.smartmatch.model.RecruiterProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RecruiterProfileRepository extends MongoRepository<RecruiterProfile, String> {
    Optional<RecruiterProfile> findByUserId(String userId);
    Optional<RecruiterProfile> findByCompanyId(String companyId);
}
