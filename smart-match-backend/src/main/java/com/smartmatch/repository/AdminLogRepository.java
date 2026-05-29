package com.smartmatch.repository;

import com.smartmatch.model.AdminLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AdminLogRepository extends MongoRepository<AdminLog, String> {
    List<AdminLog> findByAdminIdOrderByCreatedAtDesc(String adminId);
    List<AdminLog> findAllByOrderByCreatedAtDesc();
}
