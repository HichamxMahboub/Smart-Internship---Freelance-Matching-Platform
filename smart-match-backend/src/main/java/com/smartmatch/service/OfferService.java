package com.smartmatch.service;

import com.smartmatch.dto.offer.OfferFilterRequest;
import com.smartmatch.dto.offer.OfferRequest;
import com.smartmatch.dto.offer.OfferResponse;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.Company;
import com.smartmatch.model.Offer;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.OfferStatus;
import com.smartmatch.model.enums.Role;
import com.smartmatch.model.enums.ValidationStatus;
import com.smartmatch.repository.ApplicationRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.security.SecurityUserPrincipal;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class OfferService {
    private final OfferRepository offerRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final MongoTemplate mongoTemplate;

    public Page<OfferResponse> getOffers(OfferFilterRequest filter) {
        Pageable pageable = PageRequest.of(filter.page(), filter.size());
        Query query = new Query().with(pageable);
        List<Criteria> criteria = new ArrayList<>();

        if (isCurrentUserAdmin()) {
            if (filter.status() != null) {
                criteria.add(Criteria.where("status").is(filter.status()));
            }
        } else {
            criteria.add(Criteria.where("status").is(OfferStatus.PUBLISHED));
        }

        if (StringUtils.hasText(filter.keyword())) {
            Pattern keywordPattern = Pattern.compile(Pattern.quote(filter.keyword()), Pattern.CASE_INSENSITIVE);
            criteria.add(new Criteria().orOperator(
                    Criteria.where("title").regex(keywordPattern),
                    Criteria.where("description").regex(keywordPattern)
            ));
        }
        if (filter.type() != null) {
            criteria.add(Criteria.where("type").is(filter.type()));
        }
        if (StringUtils.hasText(filter.location())) {
            criteria.add(Criteria.where("location").regex(Pattern.compile(Pattern.quote(filter.location()), Pattern.CASE_INSENSITIVE)));
        }
        if (StringUtils.hasText(filter.skill())) {
            criteria.add(Criteria.where("requiredSkills").regex(Pattern.compile(Pattern.quote(filter.skill()), Pattern.CASE_INSENSITIVE)));
        }

        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Offer.class);
        List<OfferResponse> offers = mongoTemplate.find(query, Offer.class).stream()
                .map(this::toResponse)
                .toList();

        return new PageImpl<>(offers, pageable, total);
    }

    public OfferResponse getOfferById(String id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + id));
        if (offer.getStatus() != OfferStatus.PUBLISHED && !isCurrentUserAdmin()) {
            throw new NotFoundException("Offer not found with id: " + id);
        }
        return toResponse(offer);
    }

    public OfferResponse createOffer(OfferRequest request) {
        Company company = getCurrentRecruiterCompany();
        Offer offer = Offer.builder()
                .companyId(company.getId())
                .title(request.title())
                .description(request.description())
                .type(request.type())
                .location(request.location())
                .duration(request.duration())
                .requiredSkills(safeList(request.requiredSkills()))
                .status(OfferStatus.DRAFT)
                .build();
        return toResponse(offerRepository.save(offer));
    }

    public OfferResponse updateOffer(String id, OfferRequest request) {
        Offer offer = getManagedOffer(id);
        offer.setTitle(request.title());
        offer.setDescription(request.description());
        offer.setType(request.type());
        offer.setLocation(request.location());
        offer.setDuration(request.duration());
        offer.setRequiredSkills(safeList(request.requiredSkills()));
        return toResponse(offerRepository.save(offer));
    }

    public void archiveOfferByDelete(String id) {
        Offer offer = getManagedOffer(id);
        offer.setStatus(OfferStatus.ARCHIVED);
        offer.setArchiveAt(Instant.now());
        offerRepository.save(offer);
    }

    public OfferResponse publishOffer(String id) {
        Offer offer = getManagedOffer(id);
        if (!isCurrentUserAdmin()) {
            Company company = companyRepository.findById(offer.getCompanyId())
                    .orElseThrow(() -> new NotFoundException("Company not found for offer"));
            if (company.getValidationStatus() != ValidationStatus.APPROVED) {
                throw new ForbiddenException("Only approved companies can publish offers");
            }
        }
        offer.setStatus(OfferStatus.PUBLISHED);
        offer.setPublishedAt(Instant.now());
        return toResponse(offerRepository.save(offer));
    }

    public OfferResponse archiveOffer(String id) {
        Offer offer = getManagedOffer(id);
        offer.setStatus(OfferStatus.ARCHIVED);
        offer.setArchiveAt(Instant.now());
        return toResponse(offerRepository.save(offer));
    }

    public OfferResponse toResponse(Offer offer) {
        Company company = offer.getCompanyId() == null
                ? null
                : companyRepository.findById(offer.getCompanyId()).orElse(null);
        long appCount = offer.getId() == null ? 0L : applicationRepository.countByOfferId(offer.getId());
        return new OfferResponse(
                offer.getId(),
                offer.getCompanyId(),
                offer.getTitle(),
                offer.getDescription(),
                offer.getType(),
                offer.getLocation(),
                offer.getDuration(),
                safeList(offer.getRequiredSkills()),
                offer.getStatus(),
                offer.getPublishedAt(),
                offer.getArchiveAt(),
                offer.getCreatedAt(),
                offer.getUpdatedAt(),
                company != null ? company.getName() : null,
                company != null ? company.getLogoUrl() : null,
                company != null ? company.getSector() : null,
                appCount
        );
    }

    private Offer getManagedOffer(String id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Offer not found with id: " + id));
        if (isCurrentUserAdmin()) {
            return offer;
        }
        User recruiter = SecurityUtils.currentUser();
        Company company = companyRepository.findById(offer.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Company not found for offer"));
        if (!company.getRecruiterId().equals(recruiter.getId())) {
            throw new ForbiddenException("You can only manage offers that belong to your own company");
        }
        return offer;
    }

    private Company getCurrentRecruiterCompany() {
        User recruiter = SecurityUtils.currentUser();
        return companyRepository.findByRecruiterId(recruiter.getId())
                .orElseThrow(() -> new NotFoundException("Company not found for current recruiter"));
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityUserPrincipal principal)) {
            return false;
        }
        return principal.getUser().getRole() == Role.ADMIN;
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }
}
