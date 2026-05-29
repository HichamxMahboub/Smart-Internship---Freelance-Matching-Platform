package com.smartmatch.repository;

import com.smartmatch.model.CandidateProfile;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CandidateProfileRepository extends MongoRepository<CandidateProfile, String> {
    Optional<CandidateProfile> findByUserId(String userId);
}
