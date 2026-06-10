package com.smartmatch.service;

import com.smartmatch.dto.payment.CheckoutSessionResponse;
import com.smartmatch.dto.payment.FreelancePaymentRequest;
import com.smartmatch.dto.payment.PaymentResponse;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Application;
import com.smartmatch.model.Company;
import com.smartmatch.model.Offer;
import com.smartmatch.model.Payment;
import com.smartmatch.model.Subscription;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.OfferType;
import com.smartmatch.model.enums.PaymentStatus;
import com.smartmatch.model.enums.PaymentType;
import com.smartmatch.model.enums.Plan;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.SubscriptionStatus;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.PaymentRepository;
import com.smartmatch.repository.SubscriptionRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Stripe (test mode) integration for two payment flows:
 *  - FREELANCE: a recruiter pays a candidate for a freelance mission tied to an application.
 *  - SUBSCRIPTION: a user buys 30 days of Interlance Premium.
 *
 * Both use Stripe Checkout (hosted page). Because the backend runs on localhost during the demo,
 * Stripe webhooks cannot reach it, so the client confirms the payment on return via
 * {@link #confirmFromStripe(String)} which re-reads the session from Stripe. A webhook endpoint is
 * also provided for deployments that can receive Stripe events.
 */
@Service
@RequiredArgsConstructor
public class StripeService {
    private static final Logger log = Logger.getLogger(StripeService.class.getName());

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SubscriptionService subscriptionService;
    private final PaymentService paymentService;

    @Value("${smartmatch.stripe.secret-key:}")
    private String secretKey;
    @Value("${smartmatch.stripe.webhook-secret:}")
    private String webhookSecret;
    @Value("${smartmatch.stripe.currency:usd}")
    private String defaultCurrency;
    @Value("${smartmatch.stripe.success-url:https://interlance.app/pay/success}")
    private String successUrl;
    @Value("${smartmatch.stripe.cancel-url:https://interlance.app/pay/cancel}")
    private String cancelUrl;
    @Value("${smartmatch.stripe.premium-amount:99}")
    private BigDecimal premiumAmount;

    private boolean enabled() {
        return StringUtils.hasText(secretKey);
    }

    private void ensureEnabled() {
        if (!enabled()) {
            throw new BadRequestException("Online payments are not configured. Set STRIPE_SECRET_KEY.");
        }
        Stripe.apiKey = secretKey;
    }

    /** Recruiter funds a freelance payout to the candidate of an application. */
    public CheckoutSessionResponse createFreelanceCheckout(FreelancePaymentRequest request) {
        ensureEnabled();
        User recruiter = SecurityUtils.currentUser();
        Application application = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new NotFoundException("Application not found with id: " + request.applicationId()));
        Offer offer = offerRepository.findById(application.getOfferId())
                .orElseThrow(() -> new NotFoundException("Offer not found for application"));
        if (offer.getType() != OfferType.FREELANCE) {
            throw new BadRequestException("Payments are only available for freelance missions");
        }
        Company company = companyRepository.findById(offer.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Company not found for offer"));
        if (!company.getRecruiterId().equals(recruiter.getId())) {
            throw new ForbiddenException("You can only pay candidates for your own offers");
        }
        if (request.amount() == null || request.amount().signum() <= 0) {
            throw new BadRequestException("Amount must be greater than zero");
        }

        String currency = StringUtils.hasText(request.currency()) ? request.currency() : defaultCurrency;
        String description = StringUtils.hasText(request.note())
                ? request.note()
                : "Freelance payment for \"" + offer.getTitle() + "\"";

        Payment payment = paymentRepository.save(Payment.builder()
                .type(PaymentType.FREELANCE)
                .payerId(recruiter.getId())
                .userId(recruiter.getId())
                .payeeId(application.getCandidateId())
                .offerId(offer.getId())
                .applicationId(application.getId())
                .amount(request.amount())
                .currency(currency.toUpperCase())
                .method("STRIPE")
                .description(description)
                .status(PaymentStatus.PENDING)
                .build());

        Session session = createSession(currency, request.amount(), description, payment.getId());
        payment.setStripeSessionId(session.getId());
        paymentRepository.save(payment);
        return new CheckoutSessionResponse(payment.getId(), session.getId(), session.getUrl());
    }

    /** Any user buys 30 days of Premium. */
    public CheckoutSessionResponse createSubscriptionCheckout() {
        ensureEnabled();
        User user = SecurityUtils.currentUser();
        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .userId(user.getId())
                .plan(Plan.PREMIUM)
                .active(false)
                .status(SubscriptionStatus.PENDING)
                .build());

        Payment payment = paymentRepository.save(Payment.builder()
                .type(PaymentType.SUBSCRIPTION)
                .subscriptionId(subscription.getId())
                .payerId(user.getId())
                .userId(user.getId())
                .amount(premiumAmount)
                .currency(defaultCurrency.toUpperCase())
                .method("STRIPE")
                .description("Interlance Premium — 30 days")
                .status(PaymentStatus.PENDING)
                .build());

        Session session = createSession(defaultCurrency, premiumAmount, "Interlance Premium (30 days)", payment.getId());
        payment.setStripeSessionId(session.getId());
        paymentRepository.save(payment);
        return new CheckoutSessionResponse(payment.getId(), session.getId(), session.getUrl());
    }

    private Session createSession(String currency, BigDecimal amount, String name, String paymentId) {
        long unitAmount = amount.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .putMetadata("paymentId", paymentId)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(currency.toLowerCase())
                                .setUnitAmount(unitAmount)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(name)
                                        .build())
                                .build())
                        .build())
                .build();
        try {
            return Session.create(params);
        } catch (StripeException exception) {
            throw new BadRequestException("Stripe checkout could not be created: " + exception.getMessage());
        }
    }

    /** Called by the client when it returns from the Checkout page; re-reads Stripe to confirm. */
    public PaymentResponse confirmFromStripe(String paymentId) {
        ensureEnabled();
        User user = SecurityUtils.currentUser();
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment not found with id: " + paymentId));
        boolean owner = user.getId().equals(payment.getPayerId()) || user.getId().equals(payment.getUserId());
        if (!owner && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("You can only confirm your own payments");
        }
        if (payment.getStatus() == PaymentStatus.PAID) {
            return paymentService.toResponse(payment);
        }
        if (!StringUtils.hasText(payment.getStripeSessionId())) {
            throw new BadRequestException("Payment has no Stripe session to confirm");
        }
        try {
            Session session = Session.retrieve(payment.getStripeSessionId());
            if ("paid".equals(session.getPaymentStatus())) {
                markPaid(payment, session.getPaymentIntent());
            }
            return paymentService.toResponse(payment);
        } catch (StripeException exception) {
            throw new BadRequestException("Could not verify payment with Stripe: " + exception.getMessage());
        }
    }

    /** Stripe webhook handler for environments where Stripe can reach the backend. No-op if unconfigured. */
    public void handleWebhook(String payload, String signatureHeader) {
        if (!enabled() || !StringUtils.hasText(webhookSecret)) {
            return;
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, signatureHeader, webhookSecret);
        } catch (SignatureVerificationException exception) {
            throw new ForbiddenException("Invalid Stripe webhook signature");
        }
        if (!"checkout.session.completed".equals(event.getType())) {
            return;
        }
        StripeObject object = event.getDataObjectDeserializer().getObject().orElse(null);
        if (object instanceof Session session && session.getMetadata() != null) {
            String paymentId = session.getMetadata().get("paymentId");
            if (paymentId != null) {
                paymentRepository.findById(paymentId)
                        .ifPresent(payment -> markPaid(payment, session.getPaymentIntent()));
            }
        }
    }

    private void markPaid(Payment payment, String paymentIntentId) {
        if (payment.getStatus() == PaymentStatus.PAID) {
            return;
        }
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        if (paymentIntentId != null) {
            payment.setStripePaymentIntentId(paymentIntentId);
        }
        paymentRepository.save(payment);

        if (payment.getType() == PaymentType.SUBSCRIPTION) {
            subscriptionService.activatePaidSubscription(payment);
        } else if (payment.getPayeeId() != null) {
            notificationService.create(
                    payment.getPayeeId(),
                    "Payment received",
                    "You received a payment of " + payment.getAmount() + " " + payment.getCurrency()
                            + (payment.getDescription() != null ? " — " + payment.getDescription() : "") + ".",
                    NotificationType.PAYMENT);
            log.log(Level.INFO, "Freelance payment {0} marked PAID", payment.getId());
        }
    }
}
