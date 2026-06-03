package com.smartmatch.service;

import com.smartmatch.dto.admin.AdminDashboardResponse;
import com.smartmatch.dto.admin.AdminLogResponse;
import com.smartmatch.dto.admin.AdminNotificationItemResponse;
import com.smartmatch.dto.admin.AdminNotificationsOverviewResponse;
import com.smartmatch.dto.admin.AdminSubscriptionItemResponse;
import com.smartmatch.dto.admin.AdminSubscriptionsOverviewResponse;
import com.smartmatch.dto.admin.NotificationInboxSummary;
import com.smartmatch.dto.admin.RevenueMonthPoint;
import com.smartmatch.dto.admin.SubscriptionRevenueSummary;
import com.smartmatch.model.AdminLog;
import com.smartmatch.model.Analytics;
import com.smartmatch.model.Notification;
import com.smartmatch.model.Payment;
import com.smartmatch.model.Subscription;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.ApplicationStatus;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.PaymentStatus;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.SubscriptionStatus;
import com.smartmatch.model.enums.ValidationStatus;
import com.smartmatch.repository.AdminLogRepository;
import com.smartmatch.repository.AnalyticsRepository;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.NotificationRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.repository.SubscriptionRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final AnalyticsRepository analyticsRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;
    private final AdminLogRepository adminLogRepository;

    private static final BigDecimal PREMIUM_MONTHLY_PRICE = BigDecimal.valueOf(99);

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

    public AdminSubscriptionsOverviewResponse getSubscriptionsOverview() {
        List<Payment> paidPayments = paymentRepository.findAll().stream()
                .filter(payment -> payment.getStatus() == PaymentStatus.PAID)
                .toList();

        String currency = paidPayments.stream()
                .map(Payment::getCurrency)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse("MAD");

        Map<String, User> usersById = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, Function.identity(), (left, right) -> left));

        Map<String, Payment> latestPaymentBySubscription = paidPayments.stream()
                .filter(payment -> payment.getSubscriptionId() != null)
                .collect(Collectors.toMap(
                        Payment::getSubscriptionId,
                        Function.identity(),
                        (left, right) -> comparePayments(left, right) >= 0 ? left : right
                ));

        List<AdminSubscriptionItemResponse> subscriptions = subscriptionRepository.findAll().stream()
                .sorted(Comparator.comparing(Subscription::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(subscription -> toAdminSubscriptionItem(subscription, usersById, latestPaymentBySubscription))
                .toList();

        long activeSubscriptions = subscriptions.stream()
                .filter(item -> item.active() && item.status() == SubscriptionStatus.ACTIVE)
                .count();

        SubscriptionRevenueSummary revenue = buildRevenueSummary(
                paidPayments,
                currency,
                activeSubscriptions,
                userRepository.countByPlan(Plan.PREMIUM)
        );

        return new AdminSubscriptionsOverviewResponse(revenue, subscriptions);
    }

    private SubscriptionRevenueSummary buildRevenueSummary(
            List<Payment> paidPayments,
            String currency,
            long activeSubscriptions,
            long premiumUsers
    ) {
        BigDecimal totalRevenue = paidPayments.stream()
                .map(Payment::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        YearMonth currentMonth = YearMonth.now(ZoneOffset.UTC);
        BigDecimal revenueThisMonth = paidPayments.stream()
                .filter(payment -> isInMonth(payment, currentMonth))
                .map(Payment::getAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal estimatedMrr = PREMIUM_MONTHLY_PRICE.multiply(BigDecimal.valueOf(activeSubscriptions));

        List<RevenueMonthPoint> byMonth = new ArrayList<>();
        for (int offset = 5; offset >= 0; offset--) {
            YearMonth month = currentMonth.minusMonths(offset);
            List<Payment> monthPayments = paidPayments.stream()
                    .filter(payment -> isInMonth(payment, month))
                    .toList();
            BigDecimal amount = monthPayments.stream()
                    .map(Payment::getAmount)
                    .filter(value -> value != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            byMonth.add(new RevenueMonthPoint(
                    month.toString(),
                    month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + month.getYear(),
                    amount,
                    monthPayments.size()
            ));
        }

        return new SubscriptionRevenueSummary(
                totalRevenue,
                revenueThisMonth,
                estimatedMrr,
                currency,
                activeSubscriptions,
                premiumUsers,
                paidPayments.size(),
                byMonth
        );
    }

    private AdminSubscriptionItemResponse toAdminSubscriptionItem(
            Subscription subscription,
            Map<String, User> usersById,
            Map<String, Payment> latestPaymentBySubscription
    ) {
        User user = usersById.get(subscription.getUserId());
        Payment latestPayment = latestPaymentBySubscription.get(subscription.getId());

        return new AdminSubscriptionItemResponse(
                subscription.getId(),
                subscription.getUserId(),
                user != null ? user.getFullName() : "Unknown user",
                user != null ? user.getEmail() : "—",
                user != null ? user.getRole() : null,
                subscription.getPlan(),
                subscription.isActive(),
                subscription.getStartDate(),
                subscription.getExpirationDate(),
                subscription.getStatus(),
                latestPayment != null ? latestPayment.getAmount() : null,
                latestPayment != null ? latestPayment.getCurrency() : null,
                latestPayment != null ? latestPayment.getPaidAt() : null,
                subscription.getCreatedAt(),
                subscription.getUpdatedAt()
        );
    }

    private boolean isInMonth(Payment payment, YearMonth month) {
        Instant instant = payment.getPaidAt() != null ? payment.getPaidAt() : payment.getCreatedAt();
        if (instant == null) {
            return false;
        }
        YearMonth paymentMonth = YearMonth.from(instant.atZone(ZoneOffset.UTC));
        return paymentMonth.equals(month);
    }

    private int comparePayments(Payment left, Payment right) {
        Instant leftInstant = Optional.ofNullable(left.getPaidAt()).orElse(left.getCreatedAt());
        Instant rightInstant = Optional.ofNullable(right.getPaidAt()).orElse(right.getCreatedAt());
        if (leftInstant == null && rightInstant == null) {
            return 0;
        }
        if (leftInstant == null) {
            return -1;
        }
        if (rightInstant == null) {
            return 1;
        }
        return leftInstant.compareTo(rightInstant);
    }

    public AdminNotificationsOverviewResponse getNotificationsOverview() {
        User currentAdmin = SecurityUtils.currentUser();
        Map<String, User> usersById = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, Function.identity(), (left, right) -> left));

        List<Notification> allNotifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        List<AdminNotificationItemResponse> notifications = allNotifications.stream()
                .map(notification -> toAdminNotificationItem(notification, usersById))
                .toList();

        long unread = notifications.stream().filter(item -> !item.read()).count();
        long mineUnread = allNotifications.stream()
                .filter(notification -> notification.getUserId().equals(currentAdmin.getId()) && !notification.isRead())
                .count();

        NotificationInboxSummary summary = new NotificationInboxSummary(
                notifications.size(),
                unread,
                mineUnread,
                countByType(allNotifications, NotificationType.APPLICATION),
                countByType(allNotifications, NotificationType.OFFER),
                countByType(allNotifications, NotificationType.SUBSCRIPTION),
                countByType(allNotifications, NotificationType.AI),
                countByType(allNotifications, NotificationType.ADMIN)
        );

        return new AdminNotificationsOverviewResponse(summary, notifications);
    }

    private long countByType(List<Notification> notifications, NotificationType type) {
        return notifications.stream().filter(notification -> notification.getType() == type).count();
    }

    private AdminNotificationItemResponse toAdminNotificationItem(
            Notification notification,
            Map<String, User> usersById
    ) {
        User recipient = usersById.get(notification.getUserId());
        return new AdminNotificationItemResponse(
                notification.getId(),
                notification.getUserId(),
                recipient != null ? recipient.getFullName() : "Unknown user",
                recipient != null ? recipient.getEmail() : "—",
                recipient != null ? recipient.getRole() : null,
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
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
