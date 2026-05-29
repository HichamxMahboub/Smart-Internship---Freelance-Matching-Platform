package com.smartmatch.service;

import com.smartmatch.dto.admin.AdminDashboardResponse;
import com.smartmatch.dto.admin.AdminLogResponse;
import com.smartmatch.dto.subscription.SubscriptionResponse;
import com.smartmatch.model.AdminLog;
import com.smartmatch.model.Analytics;
import com.smartmatch.model.enums.ApplicationStatus;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.ValidationStatus;
import com.smartmatch.repository.AdminLogRepository;
import com.smartmatch.repository.AnalyticsRepository;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.SubscriptionRepository;
import com.smartmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final AnalyticsRepository analyticsRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AdminLogRepository adminLogRepository;
    private final SubscriptionService subscriptionService;

    public AdminDashboardResponse getDashboard() {
        Instant generatedAt = Instant.now();
        Analytics analytics = analyticsRepository.save(Analytics.builder()
                .totalUsers(userRepository.count())
                .totalCandidates(userRepository.countByRole(Role.CANDIDATE))
                .totalRecruiters(userRepository.countByRole(Role.RECRUITER))
                .totalOffers(offerRepository.count())
                .totalApplications(applicationRepository.count())
                .totalPremiumUsers(userRepository.countByPlan(Plan.PREMIUM))
                .totalCompanies(companyRepository.count())
                .pendingCompanies(companyRepository.countByValidationStatus(ValidationStatus.PENDING))
                .publishedOffers(offerRepository.countByStatus(OfferStatus.PUBLISHED))
                .pendingApplications(applicationRepository.countByStatus(ApplicationStatus.PENDING))
                .generatedAt(generatedAt)
                .build());
        return new AdminDashboardResponse(
                analytics.getTotalUsers(),
                analytics.getTotalCandidates(),
                analytics.getTotalRecruiters(),
                analytics.getTotalOffers(),
                analytics.getTotalApplications(),
                analytics.getTotalPremiumUsers(),
                analytics.getTotalCompanies(),
                analytics.getPendingCompanies(),
                analytics.getPublishedOffers(),
                analytics.getPendingApplications(),
                analytics.getGeneratedAt()
        );
    }

    public List<SubscriptionResponse> getAllSubscriptions() {
        return subscriptionRepository.findAll().stream()
                .map(subscriptionService::toResponse)
                .toList();
    }

    public List<AdminLogResponse> getAdminLogs() {
        return adminLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private AdminLogResponse toResponse(AdminLog log) {
        return new AdminLogResponse(
                log.getId(),
                log.getAdminId(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getDescription(),
                log.getCreatedAt()
        );
    }
}
