package com.smartmatch.repository;

import com.smartmatch.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    boolean existsByUserIdAndOfferId(String userId, String offerId);
    List<Favorite> findByUserId(String userId);
    Optional<Favorite> findByUserIdAndOfferId(String userId, String offerId);
    void deleteByUserIdAndOfferId(String userId, String offerId);
}
