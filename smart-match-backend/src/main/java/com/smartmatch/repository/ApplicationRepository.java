package com.smartmatch.repository;

import com.smartmatch.model.Application;
import com.smartmatch.model.enums.ApplicationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    long countByStatus(ApplicationStatus status);
    boolean existsByOfferIdAndCandidateId(String offerId, String candidateId);
    Optional<Application> findByOfferIdAndCandidateId(String offerId, String candidateId);
    List<Application> findByCandidateId(String candidateId);
    List<Application> findByRecruiterId(String recruiterId);
    List<Application> findByOfferIdIn(List<String> offerIds);
}
