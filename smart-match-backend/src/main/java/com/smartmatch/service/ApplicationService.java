package com.smartmatch.service;

import com.smartmatch.dto.application.ApplicationRequest;
import com.smartmatch.dto.application.ApplicationResponse;
import com.smartmatch.dto.application.ApplicationStatusUpdateRequest;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Application;
import com.smartmatch.model.Company;
import com.smartmatch.model.Notification;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.ApplicationStatus;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Role;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.repository.OfferRepository;
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
    private final NotificationRepository notificationRepository;

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

        notificationRepository.save(Notification.builder()
                .userId(company.getRecruiterId())
                .title("New application received")
                .message(candidate.getFullName() + " applied to " + offer.getTitle() + ".")
                .type(NotificationType.APPLICATION)
                .read(false)
                .build());

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

        application.setStatus(request.status());
        Application savedApplication = applicationRepository.save(application);

        notificationRepository.save(Notification.builder()
                .userId(savedApplication.getCandidateId())
                .title("Application status updated")
                .message("Your application for " + offer.getTitle() + " is now " + savedApplication.getStatus().name() + ".")
                .type(NotificationType.APPLICATION)
                .read(false)
                .build());

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
                application.getUpdatedAt()
        );
    }
}
