package com.smartmatch.repository;

import com.smartmatch.model.Offer;
import com.smartmatch.model.enums.OfferStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OfferRepository extends MongoRepository<Offer, String> {
    long countByStatus(OfferStatus status);
    List<Offer> findByCompanyId(String companyId);
    List<Offer> findByCompanyIdIn(List<String> companyIds);
    List<Offer> findByStatus(OfferStatus status);
}
