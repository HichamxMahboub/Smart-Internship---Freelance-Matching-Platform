package com.smartmatch.config;

import com.smartmatch.model.Application;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.Company;
import com.smartmatch.model.Notification;
import com.smartmatch.model.Offer;
import com.smartmatch.model.RecruiterProfile;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.ApplicationStatus;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.OfferType;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.ValidationStatus;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.RecruiterProfileRepository;
import com.smartmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final CompanyRepository companyRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        User admin = seedUser("seed-admin-uid", "Admin User", "admin@smartmatch.local", Role.ADMIN, Plan.PREMIUM, true);
        User candidate = seedUser("seed-candidate-uid", "Candidate User", "candidate@smartmatch.local", Role.CANDIDATE, Plan.PREMIUM, true);
        User recruiter = seedUser("seed-recruiter-uid", "Recruiter User", "recruiter@smartmatch.local", Role.RECRUITER, Plan.FREE, true);

        CandidateProfile candidateProfile = candidateProfileRepository.findByUserId(candidate.getId())
                .orElseGet(() -> candidateProfileRepository.save(CandidateProfile.builder()
                        .userId(candidate.getId())
                        .educationLevel("Master")
                        .fieldOfStudy("Computer Science")
                        .location("Casablanca")
                        .cvUrl("/uploads/cv/seed-candidate-cv.pdf")
                        .skills(List.of("Java", "Spring Boot", "React Native", "MongoDB"))
                        .languages(List.of("Arabic", "French", "English"))
                        .preferences(List.of("Internship", "Remote", "Backend"))
                        .build()));

        Company company = companyRepository.findByRecruiterId(recruiter.getId())
                .orElseGet(() -> companyRepository.save(Company.builder()
                        .recruiterId(recruiter.getId())
                        .name("SmartTech Seed")
                        .sector("Software")
                        .description("Seed company for development demos")
                        .logoUrl("https://example.com/logo.png")
                        .website("https://example.com")
                        .validationStatus(ValidationStatus.APPROVED)
                        .build()));

        recruiterProfileRepository.findByUserId(recruiter.getId())
                .orElseGet(() -> recruiterProfileRepository.save(RecruiterProfile.builder()
                        .userId(recruiter.getId())
                        .companyId(company.getId())
                        .position("HR Manager")
                        .phone("+212600000000")
                        .build()));

        Offer backendOffer = seedOffer(company.getId(), "Seed Backend Internship", "Work on Spring Boot APIs", OfferType.INTERNSHIP, "Casablanca", "3 months", List.of("Java", "Spring Boot", "MongoDB"), OfferStatus.PUBLISHED);
        seedOffer(company.getId(), "Seed Mobile Freelance Mission", "Build React Native screens", OfferType.FREELANCE, "Remote", "1 month", List.of("React Native", "TypeScript"), OfferStatus.PUBLISHED);
        seedOffer(company.getId(), "Seed Draft Data Analyst Internship", "Analyze platform data", OfferType.INTERNSHIP, "Rabat", "2 months", List.of("Python", "SQL"), OfferStatus.DRAFT);

        applicationRepository.findByOfferIdAndCandidateId(backendOffer.getId(), candidate.getId())
                .orElseGet(() -> applicationRepository.save(Application.builder()
                        .offerId(backendOffer.getId())
                        .candidateId(candidate.getId())
                        .recruiterId(recruiter.getId())
                        .message("Seed application for demo")
                        .status(ApplicationStatus.PENDING)
                        .matchingScore(75.0)
                        .appliedAt(Instant.now())
                        .build()));

        seedNotification(admin.getId(), "Seed platform ready", "Development seed data has been created.", NotificationType.ADMIN);
        seedNotification(candidate.getId(), "Welcome candidate", "Your candidate demo profile is ready.", NotificationType.ADMIN);
        seedNotification(recruiter.getId(), "Company approved", "Your seed company is approved and ready to publish offers.", NotificationType.ADMIN);

        candidateProfile.getId();
        admin.getId();
    }

    private User seedUser(String firebaseUid, String fullName, String email, Role role, Plan plan, boolean emailVerified) {
        return userRepository.findByFirebaseUid(firebaseUid)
                .orElseGet(() -> userRepository.save(User.builder()
                        .firebaseUid(firebaseUid)
                        .fullName(fullName)
                        .email(email)
                        .role(role)
                        .plan(plan)
                        .active(true)
                        .emailVerified(emailVerified)
                        .build()));
    }

    private Offer seedOffer(String companyId, String title, String description, OfferType type, String location, String duration, List<String> skills, OfferStatus status) {
        return offerRepository.findAll().stream()
                .filter(offer -> title.equals(offer.getTitle()))
                .findFirst()
                .orElseGet(() -> offerRepository.save(Offer.builder()
                        .companyId(companyId)
                        .title(title)
                        .description(description)
                        .type(type)
                        .location(location)
                        .duration(duration)
                        .requiredSkills(skills)
                        .status(status)
                        .publishedAt(status == OfferStatus.PUBLISHED ? Instant.now() : null)
                        .build()));
    }

    private void seedNotification(String userId, String title, String message, NotificationType type) {
        boolean exists = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .anyMatch(notification -> title.equals(notification.getTitle()));
        if (!exists) {
            notificationRepository.save(Notification.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .read(false)
                    .build());
        }
    }
}
