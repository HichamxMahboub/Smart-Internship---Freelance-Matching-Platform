package com.smartmatch.service;

import com.smartmatch.dto.application.ApplicationOverviewResponse;
import com.smartmatch.dto.application.ApplicationRequest;
import com.smartmatch.dto.application.ApplicationResponse;
import com.smartmatch.dto.application.ApplicationStatusUpdateRequest;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Application;
import com.smartmatch.model.Company;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.ApplicationStatus;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.security.SecurityUserPrincipal;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private static final Set<ApplicationStatus> RECRUITER_ALLOWED_STATUSES = Set.of(
            ApplicationStatus.INTERVIEW,
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED
    );

    private final ApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ApplicationResponse apply(ApplicationRequest request) {
        User candidate = SecurityUtils.currentUser();
        if (!candidate.isEmailVerified()) {
            throw new ForbiddenException("Email must be verified before applying to an offer");
        }

        Offer offer = offerRepository.findById(request.offerId())
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + request.offerId()));
        if (offer.getStatus() != OfferStatus.PUBLISHED) {
            throw new BadRequestException("Candidates can apply only to published offers");
        }
        if (applicationRepository.existsByOfferIdAndCandidateId(offer.getId(), candidate.getId())) {
            throw new ConflictException("Candidate already applied to this offer");
        }

        Company company = companyRepository.findById(offer.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Company not found for offer"));

        Application application = Application.builder()
                .offerId(offer.getId())
                .candidateId(candidate.getId())
                .recruiterId(company.getRecruiterId())
                .message(request.message())
                .status(ApplicationStatus.PENDING)
                .appliedAt(Instant.now())
                .build();
        Application savedApplication = applicationRepository.save(application);

        notificationService.create(
                company.getRecruiterId(),
                "New application received",
                candidate.getFullName() + " applied to " + offer.getTitle() + ".",
                NotificationType.APPLICATION);

        return toResponse(savedApplication);
    }

    public List<ApplicationResponse> getCurrentCandidateApplications() {
        User candidate = SecurityUtils.currentUser();
        return applicationRepository.findByCandidateId(candidate.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ApplicationResponse> getCurrentRecruiterApplications() {
        User recruiter = SecurityUtils.currentUser();
        Company company = companyRepository.findByRecruiterId(recruiter.getId())
                .orElseThrow(() -> new NotFoundException("Company not found for current recruiter"));
        List<String> offerIds = offerRepository.findByCompanyId(company.getId()).stream()
                .map(Offer::getId)
                .toList();
        if (offerIds.isEmpty()) {
            return List.of();
        }
        return applicationRepository.findByOfferIdIn(offerIds).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Application::getAppliedAt,
                        java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                .map(this::toResponse)
                .toList();
    }

    public List<ApplicationOverviewResponse> getAllApplicationsOverview() {
        java.util.Map<String, Offer> offerCache = new java.util.HashMap<>();
        java.util.Map<String, Company> companyCache = new java.util.HashMap<>();
        java.util.Map<String, User> userCache = new java.util.HashMap<>();
        return applicationRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Application::getAppliedAt,
                        java.util.Comparator.nullsLast(java.util.Comparator.reverseOrder())))
                .map(app -> toOverview(app, offerCache, companyCache, userCache))
                .toList();
    }

    private ApplicationOverviewResponse toOverview(Application application,
                                                   java.util.Map<String, Offer> offerCache,
                                                   java.util.Map<String, Company> companyCache,
                                                   java.util.Map<String, User> userCache) {
        Offer offer = offerCache.computeIfAbsent(application.getOfferId(),
                id -> offerRepository.findById(id).orElse(null));
        Company company = null;
        if (offer != null && offer.getCompanyId() != null) {
            company = companyCache.computeIfAbsent(offer.getCompanyId(),
                    id -> companyRepository.findById(id).orElse(null));
        }
        User candidate = userCache.computeIfAbsent(application.getCandidateId(),
                id -> userRepository.findById(id).orElse(null));
        User recruiter = application.getRecruiterId() == null ? null
                : userCache.computeIfAbsent(application.getRecruiterId(),
                        id -> userRepository.findById(id).orElse(null));
        return new ApplicationOverviewResponse(
                application.getId(),
                application.getOfferId(),
                offer != null ? offer.getTitle() : null,
                application.getCandidateId(),
                candidate != null ? candidate.getFullName() : null,
                candidate != null ? candidate.getEmail() : null,
                application.getRecruiterId(),
                recruiter != null ? recruiter.getFullName() : null,
                company != null ? company.getName() : null,
                application.getMessage(),
                application.getStatus(),
                application.getMatchingScore(),
                application.getAppliedAt(),
                application.getReviewedAt(),
                application.getDecidedAt(),
                application.getUpdatedAt()
        );
    }

    public ApplicationResponse getApplicationById(String id) {
        User currentUser = SecurityUtils.currentUser();
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found with id: " + id));
        if (!canViewApplication(currentUser, application)) {
            throw new ForbiddenException("You are not allowed to view this application");
        }
        return toResponse(application);
    }

    public ApplicationResponse updateApplicationStatus(String id, ApplicationStatusUpdateRequest request) {
        User recruiter = SecurityUtils.currentUser();
        if (!RECRUITER_ALLOWED_STATUSES.contains(request.status())) {
            throw new BadRequestException("Application status must be INTERVIEW, ACCEPTED or REJECTED");
        }

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found with id: " + id));
        Offer offer = offerRepository.findById(application.getOfferId())
                .orElseThrow(() -> new NotFoundException("Offer not found for application"));
        Company company = companyRepository.findById(offer.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Company not found for offer"));
        if (!company.getRecruiterId().equals(recruiter.getId())) {
            throw new ForbiddenException("You can only update applications for your own company");
        }

        ApplicationStatus prev = application.getStatus();
        application.setStatus(request.status());
        Instant now = Instant.now();
        if (prev == ApplicationStatus.PENDING && request.status() != ApplicationStatus.PENDING && application.getReviewedAt() == null) {
            application.setReviewedAt(now);
        }
        if (request.status() == ApplicationStatus.INTERVIEW && application.getReviewedAt() == null) {
            application.setReviewedAt(now);
        }
        if (request.status() == ApplicationStatus.ACCEPTED || request.status() == ApplicationStatus.REJECTED) {
            if (application.getReviewedAt() == null) {
                application.setReviewedAt(now);
            }
            application.setDecidedAt(now);
        }
        Application savedApplication = applicationRepository.save(application);

        notificationService.create(
                savedApplication.getCandidateId(),
                "Application status updated",
                "Your application for " + offer.getTitle() + " is now " + savedApplication.getStatus().name() + ".",
                NotificationType.APPLICATION);

        return toResponse(savedApplication);
    }

    private boolean canViewApplication(User currentUser, Application application) {
        if (currentUser.getRole() == Role.ADMIN) {
            return true;
        }
        if (currentUser.getRole() == Role.CANDIDATE) {
            return application.getCandidateId().equals(currentUser.getId());
        }
        if (currentUser.getRole() == Role.RECRUITER) {
            return applicationBelongsToRecruiterCompany(currentUser, application);
        }
        return false;
    }

    private boolean applicationBelongsToRecruiterCompany(User recruiter, Application application) {
        Offer offer = offerRepository.findById(application.getOfferId())
                .orElseThrow(() -> new NotFoundException("Offer not found for application"));
        Company company = companyRepository.findById(offer.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Company not found for offer"));
        return company.getRecruiterId().equals(recruiter.getId());
    }

    private ApplicationResponse toResponse(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getOfferId(),
                application.getCandidateId(),
                application.getRecruiterId(),
                application.getMessage(),
                application.getStatus(),
                application.getMatchingScore(),
                application.getAppliedAt(),
                application.getReviewedAt(),
                application.getDecidedAt(),
                application.getUpdatedAt()
        );
    }
}
