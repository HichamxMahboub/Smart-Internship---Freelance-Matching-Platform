package com.smartmatch.config;

import com.smartmatch.model.Application;
import com.smartmatch.model.AIResult;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.Company;
import com.smartmatch.model.Notification;
import com.smartmatch.model.Offer;
import com.smartmatch.model.Payment;
import com.smartmatch.model.RecruiterProfile;
import com.smartmatch.model.Subscription;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.AIResultType;
import com.smartmatch.model.enums.ApplicationStatus;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.OfferType;
import com.smartmatch.model.enums.PaymentStatus;
import com.smartmatch.model.enums.PaymentType;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.SubscriptionStatus;
import com.smartmatch.model.enums.ValidationStatus;
import com.smartmatch.repository.AIResultRepository;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CandidateProfileRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.repository.RecruiterProfileRepository;
import com.smartmatch.repository.SubscriptionRepository;
import com.smartmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final AIResultRepository aiResultRepository;

    @Override
    public void run(String... args) {
        removeDuplicateUsersByEmail();

        User admin = seedUser("seed-admin-uid", "Admin Interlance", "admin@interlance.demo", Role.ADMIN, Plan.PREMIUM, true);
        User candidate = seedUser("seed-candidate-uid", "Candidate Interlance", "candidate@interlance.demo", Role.CANDIDATE, Plan.PREMIUM, true);
        User recruiter = seedUser("seed-recruiter-uid", "Recruiter Interlance", "recruiter@interlance.demo", Role.RECRUITER, Plan.FREE, true);

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
                        .name("Interlance Demo Labs")
                        .sector("Software")
                        .description("Validated company used by the Interlance academic demonstration")
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

        Offer backendOffer = seedOffer(company.getId(), "Stage Backend Java", "Contribuer aux API Spring Boot de la plateforme.", OfferType.INTERNSHIP, "Casablanca", "3 mois", List.of("Java", "Spring Boot", "MongoDB"), OfferStatus.PUBLISHED);
        Offer freelanceOffer = seedOffer(company.getId(), "Mission Freelance Mobile", "Créer des écrans React Native pour une application métier.", OfferType.FREELANCE, "Remote", "1 mois", List.of("React Native", "TypeScript"), OfferStatus.PUBLISHED);
        seedOffer(company.getId(), "Stage Data Analyst", "Analyser les données d'usage et proposer des indicateurs.", OfferType.INTERNSHIP, "Rabat", "2 mois", List.of("Python", "SQL"), OfferStatus.DRAFT);

        seedApplication(backendOffer, candidate, recruiter, "Candidature de démonstration en attente.", ApplicationStatus.PENDING, 75.0);
        seedApplication(freelanceOffer, candidate, recruiter, "Candidature de démonstration acceptée.", ApplicationStatus.ACCEPTED, 88.0);
        seedPremiumSubscription(candidate);
        seedAiResult(candidate, backendOffer);

        seedNotification(admin.getId(), "Interlance prêt", "Les données de démonstration ont été créées.", NotificationType.ADMIN);
        seedNotification(candidate.getId(), "Bienvenue sur Interlance", "Votre profil candidat de démonstration est prêt.", NotificationType.ADMIN);
        seedNotification(candidate.getId(), "Candidature en attente", "Votre candidature au stage Backend Java est en attente.", NotificationType.APPLICATION);
        seedNotification(candidate.getId(), "Premium actif", "Votre abonnement Premium de démonstration est actif.", NotificationType.SUBSCRIPTION);
        seedNotification(candidate.getId(), "Résultat IA disponible", "Une analyse de CV de démonstration est disponible.", NotificationType.AI);
        seedNotification(recruiter.getId(), "Entreprise validée", "Interlance Demo Labs est validée et peut publier des offres.", NotificationType.ADMIN);
        seedNotification(recruiter.getId(), "Candidature acceptée", "Une candidature de démonstration a été acceptée.", NotificationType.APPLICATION);
    }

    /**
     * After Firebase login, seed placeholder UIDs are replaced with real Firebase UIDs.
     * Lookup by email first so restarts do not create a second account for the same address.
     */
    private User seedUser(String firebaseUid, String fullName, String email, Role role, Plan plan, boolean emailVerified) {
        return userRepository.findByEmail(email)
                .or(() -> userRepository.findByFirebaseUid(firebaseUid))
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

    private void removeDuplicateUsersByEmail() {
        var grouped = userRepository.findAll().stream()
                .filter(user -> StringUtils.hasText(user.getEmail()))
                .collect(Collectors.groupingBy(user -> user.getEmail().trim().toLowerCase()));

        grouped.values().stream()
                .filter(users -> users.size() > 1)
                .forEach(users -> {
                    User keeper = users.stream()
                            .max(Comparator
                                    .comparing(this::hasRealFirebaseUid)
                                    .thenComparing(User::isActive)
                                    .thenComparing(user -> user.getUpdatedAt() != null ? user.getUpdatedAt() : Instant.EPOCH))
                            .orElse(users.get(0));
                    users.stream()
                            .filter(user -> !user.getId().equals(keeper.getId()))
                            .forEach(user -> userRepository.deleteById(user.getId()));
                });
    }

    private boolean hasRealFirebaseUid(User user) {
        return StringUtils.hasText(user.getFirebaseUid()) && !user.getFirebaseUid().startsWith("seed-");
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

    private void seedApplication(Offer offer, User candidate, User recruiter, String message, ApplicationStatus status, double score) {
        applicationRepository.findByOfferIdAndCandidateId(offer.getId(), candidate.getId())
                .orElseGet(() -> applicationRepository.save(Application.builder()
                        .offerId(offer.getId())
                        .candidateId(candidate.getId())
                        .recruiterId(recruiter.getId())
                        .message(message)
                        .status(status)
                        .matchingScore(score)
                        .appliedAt(Instant.now())
                        .reviewedAt(status == ApplicationStatus.PENDING ? null : Instant.now())
                        .decidedAt(status == ApplicationStatus.ACCEPTED || status == ApplicationStatus.REJECTED ? Instant.now() : null)
                        .build()));
    }

    private void seedPremiumSubscription(User candidate) {
        Subscription subscription = subscriptionRepository.findAll().stream()
                .filter(item -> candidate.getId().equals(item.getUserId()) && item.getPlan() == Plan.PREMIUM)
                .findFirst()
                .orElseGet(() -> subscriptionRepository.save(Subscription.builder()
                        .userId(candidate.getId())
                        .plan(Plan.PREMIUM)
                        .active(true)
                        .status(SubscriptionStatus.ACTIVE)
                        .startDate(Instant.now().minus(1, java.time.temporal.ChronoUnit.DAYS))
                        .expirationDate(Instant.now().plus(29, java.time.temporal.ChronoUnit.DAYS))
                        .build()));

        paymentRepository.findAll().stream()
                .filter(item -> subscription.getId().equals(item.getSubscriptionId()))
                .findFirst()
                .orElseGet(() -> paymentRepository.save(Payment.builder()
                        .type(PaymentType.SUBSCRIPTION)
                        .subscriptionId(subscription.getId())
                        .userId(candidate.getId())
                        .payerId(candidate.getId())
                        .amount(java.math.BigDecimal.valueOf(99))
                        .currency("MAD")
                        .method("DEMO")
                        .description("Interlance Premium — données de démonstration")
                        .status(PaymentStatus.PAID)
                        .paidAt(Instant.now().minus(1, java.time.temporal.ChronoUnit.DAYS))
                        .build()));
    }

    private void seedAiResult(User candidate, Offer offer) {
        boolean exists = aiResultRepository.findAll().stream()
                .anyMatch(result -> candidate.getId().equals(result.getUserId())
                        && result.getType() == AIResultType.CV_ANALYSIS);
        if (!exists) {
            aiResultRepository.save(AIResult.builder()
                    .userId(candidate.getId())
                    .offerId(offer.getId())
                    .type(AIResultType.CV_ANALYSIS)
                    .score(84.0)
                    .extractedSkills(List.of("Java", "Spring Boot", "MongoDB", "React Native"))
                    .profileType("Backend Engineer")
                    .primaryStack("Java, Spring Boot, MongoDB")
                    .seniority("Junior")
                    .recommendation("Mettre en avant les projets Spring Boot et MongoDB dans le CV.")
                    .conclusion("Profil compatible avec le stage Backend Java de démonstration.")
                    .details("Résultat de démonstration créé par le seeder ; ne constitue pas une décision de recrutement.")
                    .analysisSource("Demo seed")
                    .build());
        }
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
