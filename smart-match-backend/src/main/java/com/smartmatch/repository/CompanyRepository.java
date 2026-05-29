package com.smartmatch.repository;

import com.smartmatch.model.Company;
import com.smartmatch.model.enums.ValidationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends MongoRepository<Company, String> {
    long countByValidationStatus(ValidationStatus validationStatus);
    Optional<Company> findByRecruiterId(String recruiterId);
    List<Company> findByValidationStatus(ValidationStatus validationStatus);
}
