package com.smartmatch.config;

import com.smartmatch.model.Application;
import com.smartmatch.model.AIResult;
import com.smartmatch.model.CandidateProfile;
import com.smartmatch.model.Company;
import com.smartmatch.model.Conversation;
import com.smartmatch.model.Education;
import com.smartmatch.model.Experience;
import com.smartmatch.model.Favorite;
import com.smartmatch.model.Message;
import com.smartmatch.model.Notification;
import com.smartmatch.model.Offer;
import com.smartmatch.model.Payment;
import com.smartmatch.model.Project;
import com.smartmatch.model.RecruiterProfile;
import com.smartmatch.model.SkillLevel;
import com.smartmatch.model.SocialLinks;
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
import com.smartmatch.repository.ConversationRepository;
import com.smartmatch.repository.FavoriteRepository;
import com.smartmatch.repository.MessageRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
    private final FavoriteRepository favoriteRepository;
    private final NotificationRepository notificationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final AIResultRepository aiResultRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    private static final Instant DEMO_BASE_TIME = Instant.parse("2026-05-01T09:00:00Z");

    @Override
    public void run(String... args) {
        removeDuplicateUsersByEmail();
        removeLegacyDemoFixtures();

        seedRichDataset();
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
    private void seedCandidateProfiles(Map<String, User> users) {
        upsertCandidateProfile(users.get("candidate"), "Développeur Full Stack Junior", "Étudiant passionné par les produits web utiles et les APIs maintenables.", "Master 2", "Ingénierie logicielle", "Casablanca", List.of("React", "Node.js", "MongoDB", "Docker", "Spring Boot"), List.of("Arabe", "Français", "Anglais"), List.of("BOTH", "Disponible dès juillet 2026", "Casablanca ou hybride"), social("candidate-interlance"), List.of(project("Interlance Demo", "Plateforme de stages et missions avec matching assisté.", "candidate-interlance")), List.of(experience("Projet académique", "Interlance", "2025", "2026", true, "Conception d'API et d'écrans mobile.")), List.of(education("Université Hassan II", "Master", "Ingénierie logicielle", "2024", "2026")));
        upsertCandidateProfile(users.get("sara"), "Développeuse Mobile React Native & UI/UX", "Je conçois des expériences mobiles simples, inclusives et rapides.", "Cycle ingénieur", "Développement digital", "Rabat", List.of("React Native", "TypeScript", "UI/UX", "Flutter", "Figma"), List.of("Arabe", "Français", "Anglais"), List.of("INTERNSHIP", "Disponible immédiatement", "Rabat ou remote"), social("sara-bennani"), List.of(project("Campus Connect", "Prototype mobile de mise en relation entre étudiants.", "sara-bennani")), List.of(experience("Stagiaire UI/UX", "Studio démo", "2025", "2025", false, "Maquettes et tests utilisateurs.")), List.of(education("INPT", "Cycle ingénieur", "Développement digital", "2023", "2026")));
        upsertCandidateProfile(users.get("yassine"), "Développeur Backend Java", "J'aime transformer des besoins métier en services fiables, testés et documentés.", "Cycle ingénieur", "Systèmes d'information", "Marrakech", List.of("Spring Boot", "Java", "PostgreSQL", "Docker", "Kubernetes"), List.of("Arabe", "Français", "Anglais"), List.of("BOTH", "Disponible en septembre 2026", "Remote ou hybride"), social("yassine-elamrani"), List.of(project("API Logistics", "API REST sécurisée pour le suivi de livraisons.", "yassine-elamrani")), List.of(experience("Développeur junior", "Lab académique", "2025", "2026", true, "APIs Java et intégration PostgreSQL.")), List.of(education("ENSA Marrakech", "Cycle ingénieur", "Systèmes d'information", "2023", "2026")));
        upsertCandidateProfile(users.get("imane"), "Data Analyst Junior", "Je transforme des données brutes en indicateurs clairs pour les équipes produit.", "Master 2", "Data Science", "Casablanca", List.of("Python", "Data Analysis", "Machine Learning", "PostgreSQL", "Power BI"), List.of("Arabe", "Français", "Anglais"), List.of("INTERNSHIP", "Disponible dès juin 2026", "Casablanca ou remote"), social("imane-zahraoui"), List.of(project("Retail KPI", "Analyse de ventes et dashboard de démonstration.", "imane-zahraoui")), List.of(experience("Analyste données", "Association étudiante", "2025", "2026", true, "Nettoyage de données et visualisation.")), List.of(education("Université Hassan II", "Master", "Data Science", "2024", "2026")));
        upsertCandidateProfile(users.get("omar"), "Ingénieur DevOps Junior", "Je documente, automatise et rends les déploiements plus reproductibles.", "Cycle ingénieur", "Cloud & DevOps", "Tanger", List.of("Docker", "Kubernetes", "CI/CD", "Linux", "Python"), List.of("Arabe", "Français", "Anglais"), List.of("BOTH", "Disponible dès août 2026", "Tanger ou remote"), social("omar-tazi"), List.of(project("Kubernetes Starter", "Déploiement de démonstration avec probes et ressources.", "omar-tazi")), List.of(experience("DevOps trainee", "Cloud club", "2025", "2026", true, "Pipelines et manifests Kubernetes.")), List.of(education("ENSA Tanger", "Cycle ingénieur", "Cloud & DevOps", "2023", "2026")));
    }

    private void seedRecruiterProfiles(Map<String, User> users, Map<String, Company> companies) {
        upsertRecruiterProfile(users.get("recruiter"), companies.get("atlas"), "Talent & Partnerships Lead", "Je recrute des profils produits et techniques pour des missions à impact.");
        upsertRecruiterProfile(users.get("amal"), companies.get("nova"), "Engineering Manager", "Je construis des équipes Java et Angular orientées qualité.");
        upsertRecruiterProfile(users.get("mehdi"), companies.get("data"), "Data Product Lead", "Je relie les besoins métier aux données et à l'IA explicable.");
        upsertRecruiterProfile(users.get("nour"), companies.get("greenpay"), "Product & Design Lead", "Je recrute des profils design et front-end pour des produits financiers responsables.");
        upsertRecruiterProfile(users.get("hajar"), companies.get("medconnect"), "QA Lead", "Je développe une culture qualité et sécurité dans les produits HealthTech.");
        upsertRecruiterProfile(users.get("salma"), companies.get("edubridge"), "Learning Experience Lead", "Je conçois des expériences EdTech accessibles.");
        upsertRecruiterProfile(users.get("othman"), companies.get("cloudscale"), "Cloud Practice Lead", "Je structure les pratiques cloud, DevOps et microservices.");
    }

    private User upsertUser(String firebaseUid, String fullName, String email, Role role, Plan plan) {
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByFirebaseUid(firebaseUid))
                .orElseGet(User::new);
        if (!hasRealFirebaseUid(user)) {
            user.setFirebaseUid(firebaseUid);
        }
        user.setFullName(fullName);
        user.setEmail(email);
        user.setRole(role);
        user.setPlan(plan);
        user.setActive(true);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private CandidateProfile upsertCandidateProfile(User user, String headline, String bio, String educationLevel, String fieldOfStudy, String location, List<String> skills, List<String> languages, List<String> preferences, SocialLinks socials, List<Project> projects, List<Experience> experiences, List<Education> educations) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElseGet(CandidateProfile::new);
        profile.setUserId(user.getId());
        profile.setPhotoUrl(null);
        profile.setHeadline(headline);
        profile.setBio(bio);
        profile.setEducationLevel(educationLevel);
        profile.setFieldOfStudy(fieldOfStudy);
        profile.setLocation(location);
        profile.setCvUrl(null);
        profile.setSkills(skills);
        profile.setSkillLevels(skillLevels(skills));
        profile.setLanguages(languages);
        profile.setPreferences(preferences);
        profile.setSocials(socials);
        profile.setProjects(projects);
        profile.setExperiences(experiences);
        profile.setEducations(educations);
        return candidateProfileRepository.save(profile);
    }

    private RecruiterProfile upsertRecruiterProfile(User user, Company company, String position, String bio) {
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId()).orElseGet(RecruiterProfile::new);
        profile.setUserId(user.getId());
        profile.setCompanyId(company.getId());
        profile.setPhotoUrl(null);
        profile.setHeadline(position);
        profile.setBio(bio);
        profile.setLinkedin("https://example.com/interlance-demo/" + user.getEmail().replace("@interlance.demo", ""));
        profile.setPosition(position);
        profile.setPhone(null);
        return recruiterProfileRepository.save(profile);
    }

    private Company upsertCompany(User recruiter, String name, String sector, String size, String location, String logoLabel, String description, ValidationStatus status) {
        Company company = companyRepository.findAll().stream()
                .filter(item -> name.equalsIgnoreCase(item.getName()))
                .findFirst()
                .orElseGet(Company::new);
        company.setRecruiterId(recruiter.getId());
        company.setName(name);
        company.setSector(sector);
        company.setSize(size);
        company.setLocation(location);
        company.setDescription(description);
        // The UI derives this readable label (ADS, NA, DSM, ...) from the company name.
        company.setLogoUrl(null);
        company.setWebsite("https://example.com/interlance-demo/" + logoLabel.toLowerCase());
        company.setValidationStatus(status);
        return companyRepository.save(company);
    }
    private Offer upsertOffer(Company company, String title, String description, OfferType type, String location, String duration, List<String> skills, int dayOffset) {
        Offer offer = offerRepository.findByCompanyId(company.getId()).stream()
                .filter(item -> title.equals(item.getTitle()))
                .findFirst()
                .orElseGet(Offer::new);
        offer.setCompanyId(company.getId());
        offer.setTitle(title);
        offer.setDescription(description);
        offer.setType(type);
        offer.setLocation(location);
        offer.setDuration(duration);
        offer.setRequiredSkills(skills);
        // PUBLISHED is the supported "active" state in the current OfferStatus enum.
        offer.setStatus(OfferStatus.PUBLISHED);
        offer.setPublishedAt(demoTime(dayOffset));
        if (offer.getCreatedAt() == null) {
            offer.setCreatedAt(demoTime(dayOffset - 1));
        }
        offer.setUpdatedAt(demoTime(dayOffset));
        return offerRepository.save(offer);
    }

    private Application upsertApplication(Offer offer, User candidate, User recruiter, String message, ApplicationStatus status, double score, int dayOffset) {
        Application application = applicationRepository.findByOfferIdAndCandidateId(offer.getId(), candidate.getId())
                .orElseGet(Application::new);
        application.setOfferId(offer.getId());
        application.setCandidateId(candidate.getId());
        application.setRecruiterId(recruiter.getId());
        application.setMessage(message);
        application.setStatus(status);
        application.setMatchingScore(score);
        application.setAppliedAt(demoTime(dayOffset));
        application.setReviewedAt(status == ApplicationStatus.PENDING ? null : demoTime(dayOffset + 1));
        application.setDecidedAt(status == ApplicationStatus.ACCEPTED || status == ApplicationStatus.REJECTED ? demoTime(dayOffset + 2) : null);
        return applicationRepository.save(application);
    }

    private void upsertFavorite(User user, Offer offer, int dayOffset) {
        Favorite favorite = favoriteRepository.findByUserIdAndOfferId(user.getId(), offer.getId()).orElseGet(Favorite::new);
        favorite.setUserId(user.getId());
        favorite.setOfferId(offer.getId());
        if (favorite.getCreatedAt() == null) {
            favorite.setCreatedAt(demoTime(dayOffset));
        }
        favoriteRepository.save(favorite);
    }

    private Subscription upsertSubscription(User user, Plan plan, boolean active, SubscriptionStatus status, int startDay, int expirationDay) {
        Subscription subscription = subscriptionRepository.findByUserId(user.getId()).stream()
                .filter(item -> item.getPlan() == plan)
                .findFirst()
                .orElseGet(Subscription::new);
        subscription.setUserId(user.getId());
        subscription.setPlan(plan);
        subscription.setActive(active);
        subscription.setStatus(status);
        subscription.setStartDate(demoTime(startDay));
        subscription.setExpirationDate(demoTime(expirationDay));
        return subscriptionRepository.save(subscription);
    }

    private void upsertPayment(String reference, User user, String subscriptionId, PaymentStatus status, int amount, int dayOffset) {
        Payment payment = paymentRepository.findAll().stream()
                .filter(item -> reference.equals(item.getDescription()))
                .findFirst()
                .orElseGet(Payment::new);
        payment.setType(PaymentType.SUBSCRIPTION);
        payment.setSubscriptionId(subscriptionId);
        payment.setUserId(user.getId());
        payment.setPayerId(user.getId());
        payment.setPayeeId(null);
        payment.setOfferId(null);
        payment.setApplicationId(null);
        payment.setDescription(reference);
        payment.setAmount(BigDecimal.valueOf(amount));
        payment.setCurrency("MAD");
        payment.setMethod("DEMO");
        payment.setStatus(status);
        payment.setPaidAt(status == PaymentStatus.PAID ? demoTime(dayOffset) : null);
        paymentRepository.save(payment);
    }
    private void upsertAiResult(User user, Offer offer, String applicationId, AIResultType type, double score, List<String> skills, String profileType, String primaryStack, String seniority, String recommendation, String conclusion, int dayOffset) {
        AIResult result = aiResultRepository.findAll().stream()
                .filter(item -> user.getId().equals(item.getUserId()) && offer.getId().equals(item.getOfferId()) && item.getType() == type)
                .findFirst()
                .orElseGet(AIResult::new);
        result.setUserId(user.getId());
        result.setOfferId(offer.getId());
        result.setApplicationId(applicationId);
        result.setType(type);
        result.setScore(score);
        result.setExtractedSkills(skills);
        result.setSkillLevels(skillLevels(skills));
        result.setProfileType(profileType);
        result.setPrimaryStack(primaryStack);
        result.setSeniority(seniority);
        result.setRecommendation(recommendation);
        result.setConclusion(conclusion);
        result.setDetails("Résultat IA de démonstration : une recommandation explicable, sans décision automatique de recrutement.");
        result.setAnalysisSource("Demo seed");
        if (result.getCreatedAt() == null) result.setCreatedAt(demoTime(dayOffset));
        aiResultRepository.save(result);
    }

    private void upsertNotification(String userId, String title, String message, NotificationType type, int dayOffset) {
        Notification notification = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(item -> title.equals(item.getTitle())).findFirst().orElseGet(Notification::new);
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        if (notification.getCreatedAt() == null) notification.setCreatedAt(demoTime(dayOffset));
        notificationRepository.save(notification);
    }

    private Conversation upsertConversation(Offer offer, User candidate, User recruiter, String lastMessage, int dayOffset) {
        Conversation conversation = conversationRepository.findByOfferIdAndCandidateIdAndRecruiterId(offer.getId(), candidate.getId(), recruiter.getId()).orElseGet(Conversation::new);
        conversation.setOfferId(offer.getId());
        conversation.setCandidateId(candidate.getId());
        conversation.setRecruiterId(recruiter.getId());
        conversation.setLastMessage(lastMessage);
        conversation.setLastMessageAt(demoTime(dayOffset));
        conversation.setCandidateUnread(1);
        conversation.setRecruiterUnread(0);
        return conversationRepository.save(conversation);
    }

    private void upsertMessage(Conversation conversation, User sender, String content, int dayOffset) {
        boolean exists = messageRepository.findAll().stream()
                .anyMatch(item -> conversation.getId().equals(item.getConversationId()) && content.equals(item.getContent()));
        if (!exists) {
            messageRepository.save(Message.builder().conversationId(conversation.getId()).senderId(sender.getId()).content(content).read(false).createdAt(demoTime(dayOffset)).build());
        }
    }

    private List<SkillLevel> skillLevels(List<String> skills) {
        List<SkillLevel> levels = new ArrayList<>();
        for (int index = 0; index < skills.size(); index++) {
            levels.add(SkillLevel.builder().name(skills.get(index)).level(Math.max(68, 92 - index * 6)).build());
        }
        return levels;
    }

    private SocialLinks social(String slug) {
        return SocialLinks.builder()
                .github("https://example.com/interlance-demo/" + slug + "/github")
                .linkedin("https://example.com/interlance-demo/" + slug + "/linkedin")
                .website("https://example.com/interlance-demo/" + slug)
                .build();
    }

    private Project project(String title, String description, String slug) {
        return Project.builder().title(title).description(description)
                .link("https://example.com/interlance-demo/" + slug + "/project")
                .imageUrl(null).build();
    }

    private Experience experience(String role, String org, String start, String end, boolean current, String description) {
        return Experience.builder().role(role).org(org).start(start).end(end).current(current).description(description).build();
    }

    private Education education(String school, String degree, String field, String start, String end) {
        return Education.builder().school(school).degree(degree).field(field).start(start).end(end).build();
    }

    private Instant demoTime(int dayOffset) {
        return DEMO_BASE_TIME.plus(dayOffset, ChronoUnit.DAYS);
    }
    private void removeLegacyDemoFixtures() {
        List<Company> legacyCompanies = companyRepository.findAll().stream()
                .filter(company -> "Interlance Demo Labs".equals(company.getName()))
                .filter(company -> "Validated company used by the Interlance academic demonstration".equals(company.getDescription()))
                .collect(Collectors.toList());

        for (Company company : legacyCompanies) {
            List<Offer> legacyOffers = offerRepository.findByCompanyId(company.getId());
            List<String> offerIds = legacyOffers.stream().map(Offer::getId).collect(Collectors.toList());
            if (!offerIds.isEmpty()) {
                List<Conversation> legacyConversations = conversationRepository.findAll().stream()
                        .filter(conversation -> offerIds.contains(conversation.getOfferId()))
                        .collect(Collectors.toList());
                List<String> conversationIds = legacyConversations.stream().map(Conversation::getId).collect(Collectors.toList());

                if (!conversationIds.isEmpty()) {
                    messageRepository.deleteAll(messageRepository.findAll().stream()
                            .filter(message -> conversationIds.contains(message.getConversationId()))
                            .collect(Collectors.toList()));
                    conversationRepository.deleteAll(legacyConversations);
                }
                applicationRepository.deleteAll(applicationRepository.findByOfferIdIn(offerIds));
                favoriteRepository.deleteAll(favoriteRepository.findAll().stream()
                        .filter(favorite -> offerIds.contains(favorite.getOfferId()))
                        .collect(Collectors.toList()));
                aiResultRepository.deleteAll(aiResultRepository.findAll().stream()
                        .filter(result -> offerIds.contains(result.getOfferId()))
                        .collect(Collectors.toList()));
                offerRepository.deleteAll(legacyOffers);
            }
            companyRepository.delete(company);
        }

        paymentRepository.deleteAll(paymentRepository.findAll().stream()
                .filter(payment -> "Interlance Premium — données de démonstration".equals(payment.getDescription()))
                .collect(Collectors.toList()));
    }


    private void seedRichDataset() {
        Map<String, User> users = new LinkedHashMap<>();
        users.put("admin", upsertUser("seed-admin-uid", "Admin Interlance", "admin@interlance.demo", Role.ADMIN, Plan.PREMIUM));
        users.put("candidate", upsertUser("seed-candidate-uid", "Candidate Interlance", "candidate@interlance.demo", Role.CANDIDATE, Plan.PREMIUM));
        users.put("sara", upsertUser("seed-sara-bennani-uid", "Sara Bennani", "sara.bennani@interlance.demo", Role.CANDIDATE, Plan.FREE));
        users.put("yassine", upsertUser("seed-yassine-elamrani-uid", "Yassine El Amrani", "yassine.elamrani@interlance.demo", Role.CANDIDATE, Plan.FREE));
        users.put("imane", upsertUser("seed-imane-zahraoui-uid", "Imane Zahraoui", "imane.zahraoui@interlance.demo", Role.CANDIDATE, Plan.FREE));
        users.put("omar", upsertUser("seed-omar-tazi-uid", "Omar Tazi", "omar.tazi@interlance.demo", Role.CANDIDATE, Plan.FREE));
        users.put("recruiter", upsertUser("seed-recruiter-uid", "Recruiter Interlance", "recruiter@interlance.demo", Role.RECRUITER, Plan.PREMIUM));
        users.put("amal", upsertUser("seed-amal-idrissi-uid", "Amal Idrissi", "amal.idrissi@interlance.demo", Role.RECRUITER, Plan.FREE));
        users.put("mehdi", upsertUser("seed-mehdi-alami-uid", "Mehdi Alami", "mehdi.alami@interlance.demo", Role.RECRUITER, Plan.FREE));
        users.put("nour", upsertUser("seed-nour-belghiti-uid", "Nour Belghiti", "nour.belghiti@interlance.demo", Role.RECRUITER, Plan.FREE));
        // Additional synthetic owners keep exactly one company per recruiter profile.
        users.put("hajar", upsertUser("seed-hajar-el-fassi-uid", "Hajar El Fassi", "hajar.elfassi@interlance.demo", Role.RECRUITER, Plan.FREE));
        users.put("salma", upsertUser("seed-salma-aitlahcen-uid", "Salma Ait Lahcen", "salma.aitlahcen@interlance.demo", Role.RECRUITER, Plan.FREE));
        users.put("othman", upsertUser("seed-othman-berrada-uid", "Othman Berrada", "othman.berrada@interlance.demo", Role.RECRUITER, Plan.FREE));

        seedCandidateProfiles(users);

        Map<String, Company> companies = new LinkedHashMap<>();
        companies.put("atlas", upsertCompany(users.get("recruiter"), "Atlas Digital Solutions", "Technologies numériques", "51–200", "Casablanca", "ADS", "Équipe marocaine qui conçoit des plateformes web et mobiles pour les PME et les services publics.", ValidationStatus.APPROVED));
        companies.put("nova", upsertCompany(users.get("amal"), "NovaTech Africa", "Conseil logiciel", "11–50", "Rabat", "NA", "Cabinet produit spécialisé dans les architectures Java, Angular et l'intégration de systèmes.", ValidationStatus.APPROVED));
        companies.put("data", upsertCompany(users.get("mehdi"), "DataSprint Morocco", "Data & IA", "11–50", "Casablanca", "DSM", "Studio data qui transforme des données métier en tableaux de bord et assistants IA responsables.", ValidationStatus.APPROVED));
        companies.put("greenpay", upsertCompany(users.get("nour"), "GreenPay Fintech", "Fintech", "51–200", "Casablanca", "GP", "Fintech responsable développant des produits de paiement et de pilotage financier.", ValidationStatus.APPROVED));
        companies.put("medconnect", upsertCompany(users.get("hajar"), "MedConnect Health", "HealthTech", "11–50", "Rabat", "MH", "Équipe HealthTech qui améliore le suivi des parcours patients avec des outils sécurisés.", ValidationStatus.APPROVED));
        companies.put("edubridge", upsertCompany(users.get("salma"), "EduBridge Labs", "EdTech", "11–50", "Fès", "EL", "Laboratoire EdTech proposant des expériences d'apprentissage accessibles et collaboratives.", ValidationStatus.PENDING));
        companies.put("cloudscale", upsertCompany(users.get("othman"), "CloudScale Consulting", "Cloud & DevOps", "51–200", "Tanger", "CC", "Consulting cloud, microservices et pratiques DevOps pour équipes produit.", ValidationStatus.APPROVED));
        seedRecruiterProfiles(users, companies);

        Map<String, Offer> offers = new LinkedHashMap<>();
        offers.put("mern", upsertOffer(companies.get("atlas"), "Stage PFE Full Stack MERN", "Participer à une plateforme SaaS avec React, Node.js et MongoDB. Indemnité de démonstration : 1 500 MAD/mois.", OfferType.INTERNSHIP, "Casablanca", "6 mois", List.of("React", "Node.js", "MongoDB", "Docker"), 2));
        offers.put("spring-angular", upsertOffer(companies.get("nova"), "Stage Développeur Spring Boot / Angular", "Développer des APIs sécurisées et des interfaces Angular pour un portail métier. Indemnité de démonstration : 1 800 MAD/mois.", OfferType.INTERNSHIP, "Rabat", "6 mois", List.of("Spring Boot", "Angular", "PostgreSQL", "Docker"), 3));
        offers.put("ux", upsertOffer(companies.get("greenpay"), "Mission Freelance UI/UX Dashboard SaaS", "Concevoir les parcours et maquettes d'un dashboard financier. Budget de démonstration : 8 000 MAD.", OfferType.FREELANCE, "Remote", "5 semaines", List.of("UI/UX", "Figma", "Design System"), 4));
        offers.put("react-native", upsertOffer(companies.get("atlas"), "Stage Mobile React Native", "Créer des écrans mobiles accessibles et connecter l'application aux APIs Interlance. Indemnité de démonstration : 1 600 MAD/mois.", OfferType.INTERNSHIP, "Casablanca / Hybride", "4 mois", List.of("React Native", "TypeScript", "REST API", "UI/UX"), 5));
        offers.put("api", upsertOffer(companies.get("cloudscale"), "Freelance Backend API Integration", "Intégrer des APIs partenaires et améliorer les tests d'intégration. Budget de démonstration : 10 000 MAD.", OfferType.FREELANCE, "Remote", "6 semaines", List.of("Spring Boot", "Node.js", "PostgreSQL", "Docker"), 6));
        offers.put("data-analyst", upsertOffer(companies.get("data"), "Stage Data Analyst", "Préparer des jeux de données, suivre des KPI et produire des visualisations utiles. Indemnité de démonstration : 1 500 MAD/mois.", OfferType.INTERNSHIP, "Casablanca", "4 mois", List.of("Python", "Data Analysis", "PostgreSQL", "Power BI"), 7));
        offers.put("devops", upsertOffer(companies.get("cloudscale"), "Stage DevOps Docker Kubernetes", "Automatiser les déploiements et documenter une architecture Kubernetes. Indemnité de démonstration : 1 900 MAD/mois.", OfferType.INTERNSHIP, "Tanger / Hybride", "6 mois", List.of("Docker", "Kubernetes", "CI/CD", "Linux"), 8));
        offers.put("n8n", upsertOffer(companies.get("nova"), "Mission n8n Automation Specialist", "Construire des workflows n8n pour synchroniser notifications et données métier. Budget de démonstration : 7 000 MAD.", OfferType.FREELANCE, "Remote", "1 mois", List.of("n8n", "REST API", "Node.js", "Automation"), 9));
        offers.put("qa", upsertOffer(companies.get("medconnect"), "Stage QA / Test Automation", "Écrire des scénarios de test et renforcer la qualité d'une application HealthTech. Indemnité de démonstration : 1 400 MAD/mois.", OfferType.INTERNSHIP, "Rabat", "4 mois", List.of("QA", "Test Automation", "Postman", "Selenium"), 10));
        offers.put("next", upsertOffer(companies.get("greenpay"), "Freelance Landing Page Next.js", "Livrer une landing page performante, responsive et mesurable. Budget de démonstration : 5 000 MAD.", OfferType.FREELANCE, "Remote", "3 semaines", List.of("Next.js", "React", "UI/UX", "SEO"), 11));
        offers.put("cloud", upsertOffer(companies.get("cloudscale"), "Stage Cloud & Microservices", "Découper un service monolithique et observer ses flux dans un environnement cloud. Indemnité de démonstration : 2 000 MAD/mois.", OfferType.INTERNSHIP, "Tanger", "6 mois", List.of("Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"), 12));
        offers.put("chatbot", upsertOffer(companies.get("data"), "Mission Chatbot Assistant IA", "Prototyper un assistant conversationnel avec garde-fous de confidentialité. Budget de démonstration : 9 000 MAD.", OfferType.FREELANCE, "Casablanca / Remote", "6 semaines", List.of("Python", "Machine Learning", "OpenRouter", "n8n"), 13));

        Application candidateMern = upsertApplication(offers.get("mern"), users.get("candidate"), users.get("recruiter"), "Je souhaite contribuer à une application concrète avec React et MongoDB, en apportant mes projets full stack.", ApplicationStatus.PENDING, 84.0, 15);
        upsertApplication(offers.get("react-native"), users.get("candidate"), users.get("recruiter"), "Mon expérience React Native et TypeScript correspond aux écrans mobiles demandés.", ApplicationStatus.INTERVIEW, 91.0, 16);
        Application saraSpring = upsertApplication(offers.get("spring-angular"), users.get("sara"), users.get("amal"), "Je veux mettre à profit mon parcours mobile et mon intérêt pour les APIs Spring Boot dans une équipe produit.", ApplicationStatus.ACCEPTED, 88.0, 17);
        upsertApplication(offers.get("ux"), users.get("sara"), users.get("nour"), "Je peux transformer les besoins des utilisateurs en parcours simples et testables pour ce dashboard SaaS.", ApplicationStatus.PENDING, 82.0, 18);
        upsertApplication(offers.get("next"), users.get("sara"), users.get("nour"), "Je propose une landing page Next.js accessible, optimisée et cohérente avec votre design system.", ApplicationStatus.REJECTED, 76.0, 19);
        upsertApplication(offers.get("api"), users.get("yassine"), users.get("othman"), "Mon expérience Java, Spring Boot et PostgreSQL me permettrait de sécuriser les intégrations API.", ApplicationStatus.INTERVIEW, 91.0, 20);
        upsertApplication(offers.get("cloud"), users.get("yassine"), users.get("othman"), "Je souhaite approfondir les microservices et l'observabilité dans un contexte cloud structuré.", ApplicationStatus.PENDING, 86.0, 21);
        upsertApplication(offers.get("data-analyst"), users.get("imane"), users.get("mehdi"), "Je peux produire des analyses actionnables à partir de données nettoyées et documentées.", ApplicationStatus.ACCEPTED, 91.0, 22);
        upsertApplication(offers.get("chatbot"), users.get("imane"), users.get("mehdi"), "Je veux contribuer à un assistant IA explicable, avec attention aux données sensibles.", ApplicationStatus.PENDING, 84.0, 23);
        upsertApplication(offers.get("devops"), users.get("omar"), users.get("othman"), "Docker, Kubernetes et les pipelines CI/CD sont au centre de mon projet de fin d'études.", ApplicationStatus.INTERVIEW, 89.0, 24);
        upsertApplication(offers.get("n8n"), users.get("omar"), users.get("amal"), "Je peux relier les APIs métier avec des workflows n8n maintenables et documentés.", ApplicationStatus.PENDING, 79.0, 25);
        upsertApplication(offers.get("qa"), users.get("candidate"), users.get("hajar"), "Je souhaite consolider mes compétences de qualité logicielle et d'automatisation de tests.", ApplicationStatus.REJECTED, 76.0, 26);

        upsertFavorite(users.get("candidate"), offers.get("mern"), 27);
        upsertFavorite(users.get("candidate"), offers.get("chatbot"), 28);
        upsertFavorite(users.get("sara"), offers.get("react-native"), 29);
        upsertFavorite(users.get("sara"), offers.get("ux"), 30);
        upsertFavorite(users.get("yassine"), offers.get("cloud"), 31);
        upsertFavorite(users.get("imane"), offers.get("data-analyst"), 32);
        upsertFavorite(users.get("omar"), offers.get("devops"), 33);

        Subscription candidatePremium = upsertSubscription(users.get("candidate"), Plan.PREMIUM, true, SubscriptionStatus.ACTIVE, 1, 91);
        upsertSubscription(users.get("recruiter"), Plan.PREMIUM, true, SubscriptionStatus.ACTIVE, 1, 181);
        Subscription saraPending = upsertSubscription(users.get("sara"), Plan.PREMIUM, false, SubscriptionStatus.PENDING, 34, 64);
        for (User user : List.of(users.get("sara"), users.get("yassine"), users.get("imane"), users.get("omar"), users.get("amal"), users.get("mehdi"), users.get("nour"), users.get("hajar"), users.get("salma"), users.get("othman"))) {
            upsertSubscription(user, Plan.FREE, true, SubscriptionStatus.ACTIVE, 1, 365);
        }

        upsertPayment("DEMO-PAY-001", users.get("candidate"), candidatePremium.getId(), PaymentStatus.PAID, 99, 1);
        upsertPayment("DEMO-PAY-002", users.get("sara"), saraPending.getId(), PaymentStatus.PENDING, 99, 34);
        upsertPayment("DEMO-PAY-003", users.get("yassine"), null, PaymentStatus.FAILED, 99, 35);

        upsertAiResult(users.get("candidate"), offers.get("mern"), candidateMern.getId(), AIResultType.CV_ANALYSIS, 84.0, List.of("React", "Node.js", "MongoDB", "Docker"), "Full Stack Junior", "React, Node.js, MongoDB", "Junior", "Forces : projets full stack et bases Docker. Compétence à renforcer : tests automatisés.", "Profil compatible avec le stage PFE Full Stack MERN.", 36);
        upsertAiResult(users.get("sara"), offers.get("react-native"), saraSpring.getId(), AIResultType.OFFER_RECOMMENDATION, 91.0, List.of("React Native", "UI/UX", "TypeScript"), "Mobile Developer", "React Native, TypeScript, UI/UX", "Junior", "Forces : expérience mobile et sens de l'interface. À compléter : tests E2E.", "Recommandation forte pour les offres mobiles et front-end.", 37);
        upsertAiResult(users.get("imane"), offers.get("data-analyst"), null, AIResultType.CANDIDATE_RECOMMENDATION, 91.0, List.of("Python", "Data Analysis", "PostgreSQL"), "Data Analyst", "Python, SQL, Data Analysis", "Junior", "Forces : préparation de données et visualisation. À compléter : déploiement de modèles.", "Profil recommandé pour le stage Data Analyst.", 38);

        upsertNotification(users.get("admin").getId(), "Interlance prêt", "Les données riches de démonstration sont disponibles dans smart_match.", NotificationType.ADMIN, 39);
        upsertNotification(users.get("recruiter").getId(), "Nouvelle candidature reçue", "Candidate Interlance a postulé au Stage PFE Full Stack MERN.", NotificationType.APPLICATION, 40);
        upsertNotification(users.get("candidate").getId(), "Statut mis à jour", "Votre candidature React Native est passée à l'étape entretien.", NotificationType.APPLICATION, 41);
        upsertNotification(users.get("sara").getId(), "Nouvelle recommandation IA", "Une recommandation Mobile React Native est disponible avec un score indicatif de 91 %.", NotificationType.AI, 42);
        upsertNotification(users.get("recruiter").getId(), "Abonnement Premium activé", "Le plan Premium de démonstration est actif pour Atlas Digital Solutions.", NotificationType.SUBSCRIPTION, 43);
        upsertNotification(users.get("omar").getId(), "Profil à compléter", "Ajoutez un projet CI/CD pour augmenter la pertinence des recommandations DevOps.", NotificationType.ADMIN, 44);

        Conversation conversation = upsertConversation(offers.get("spring-angular"), users.get("sara"), users.get("amal"), "Bienvenue Sara, votre candidature est acceptée. Pouvons-nous organiser un échange cette semaine ?", 45);
        upsertMessage(conversation, users.get("amal"), "Bonjour Sara, votre candidature est acceptée. Pouvons-nous organiser un échange cette semaine ?", 45);
        upsertMessage(conversation, users.get("sara"), "Merci Amal, avec plaisir. Je suis disponible mardi ou jeudi après-midi.", 46);
        upsertMessage(conversation, users.get("amal"), "Parfait, je vous envoie une invitation de démonstration pour jeudi à 15 h.", 47);
    }
}
