package com.smartmatch.service;

import com.smartmatch.dto.company.CompanyOverviewResponse;
import com.smartmatch.dto.company.CompanyRequest;
import com.smartmatch.dto.company.CompanyResponse;
import com.smartmatch.dto.company.CompanyValidationRequest;
import com.smartmatch.exception.BadRequestException;
import com.smartmatch.exception.ConflictException;
import com.smartmatch.exception.ForbiddenException;
import com.smartmatch.exception.NotFoundException;
import com.smartmatch.model.AdminLog;
import com.smartmatch.model.Company;
import com.smartmatch.model.RecruiterProfile;
import com.smartmatch.model.User;
import com.smartmatch.model.enums.NotificationType;
import com.smartmatch.model.enums.ValidationStatus;
import com.smartmatch.repository.AdminLogRepository;
import com.smartmatch.repository.CompanyRepository;
import com.smartmatch.repository.OfferRepository;
import com.smartmatch.repository.RecruiterProfileRepository;
import com.smartmatch.repository.UserRepository;
import com.smartmatch.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final AdminLogRepository adminLogRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;

    public CompanyResponse createCompany(CompanyRequest request) {
        User recruiter = SecurityUtils.currentUser();
        if (companyRepository.findByRecruiterId(recruiter.getId()).isPresent()) {
            throw new ConflictException("Recruiter already has a company");
        }

        Company company = Company.builder()
                .recruiterId(recruiter.getId())
                .name(request.name())
                .sector(request.sector())
                .size(request.size())
                .location(request.location())
                .description(request.description())
                .logoUrl(request.logoUrl())
                .website(request.website())
                .validationStatus(ValidationStatus.PENDING)
                .build();

        Company savedCompany = companyRepository.save(company);
        RecruiterProfile profile = recruiterProfileRepository.findByUserId(recruiter.getId())
                .orElseGet(() -> RecruiterProfile.builder().userId(recruiter.getId()).build());
        profile.setCompanyId(savedCompany.getId());
        recruiterProfileRepository.save(profile);

        return toResponse(savedCompany);
    }

    public CompanyResponse getCurrentRecruiterCompany() {
        User recruiter = SecurityUtils.currentUser();
        return companyRepository.findByRecruiterId(recruiter.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Company not found for current recruiter"));
    }

    public CompanyResponse updateCompany(String id, CompanyRequest request) {
        User recruiter = SecurityUtils.currentUser();
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found with id: " + id));

        if (!company.getRecruiterId().equals(recruiter.getId())) {
            throw new ForbiddenException("You can only update your own company");
        }

        company.setName(request.name());
        company.setSector(request.sector());
        company.setSize(request.size());
        company.setLocation(request.location());
        company.setDescription(request.description());
        company.setLogoUrl(request.logoUrl());
        company.setWebsite(request.website());
        company.setValidationStatus(ValidationStatus.PENDING);

        return toResponse(companyRepository.save(company));
    }

    public Page<CompanyResponse> getCompaniesPage(int page, int size) {
        return companyRepository.findAll(PageRequest.of(page, size)).map(this::toResponse);
    }

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CompanyOverviewResponse> getAllCompaniesOverview() {
        List<Company> companies = companyRepository.findAll();
        if (companies.isEmpty()) {
            return List.of();
        }
        java.util.Set<String> recruiterIds = companies.stream()
                .map(Company::getRecruiterId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Map<String, User> recruitersById = recruiterIds.isEmpty()
                ? java.util.Map.of()
                : userRepository.findAllById(recruiterIds).stream()
                        .collect(java.util.stream.Collectors.toMap(User::getId, java.util.function.Function.identity(), (a, b) -> a));
        java.util.Map<String, RecruiterProfile> recruiterProfiles = new java.util.HashMap<>();
        for (String rid : recruiterIds) {
            recruiterProfileRepository.findByUserId(rid).ifPresent(rp -> recruiterProfiles.put(rid, rp));
        }
        List<String> companyIds = companies.stream().map(Company::getId).toList();
        java.util.Map<String, Long> totalOffersByCompany = new java.util.HashMap<>();
        java.util.Map<String, Long> publishedOffersByCompany = new java.util.HashMap<>();
        if (!companyIds.isEmpty()) {
            for (com.smartmatch.model.Offer offer : offerRepository.findByCompanyIdIn(companyIds)) {
                String cid = offer.getCompanyId();
                totalOffersByCompany.merge(cid, 1L, Long::sum);
                if (offer.getStatus() == com.smartmatch.model.enums.OfferStatus.PUBLISHED) {
                    publishedOffersByCompany.merge(cid, 1L, Long::sum);
                }
            }
        }
        return companies.stream()
                .map(c -> {
                    User u = recruitersById.get(c.getRecruiterId());
                    RecruiterProfile rp = recruiterProfiles.get(c.getRecruiterId());
                    return new CompanyOverviewResponse(
                            c.getId(), c.getRecruiterId(), c.getName(), c.getSector(), c.getSize(),
                            c.getLocation(), c.getDescription(), c.getLogoUrl(), c.getWebsite(),
                            c.getValidationStatus(), c.getCreatedAt(), c.getUpdatedAt(),
                            u != null ? u.getFullName() : null,
                            u != null ? u.getEmail() : null,
                            rp != null ? rp.getPhotoUrl() : null,
                            totalOffersByCompany.getOrDefault(c.getId(), 0L),
                            publishedOffersByCompany.getOrDefault(c.getId(), 0L)
                    );
                })
                .toList();
    }

    public CompanyResponse validateCompany(String id, CompanyValidationRequest request) {
        User admin = SecurityUtils.currentUser();
        if (request.validationStatus() != ValidationStatus.APPROVED && request.validationStatus() != ValidationStatus.REJECTED) {
            throw new BadRequestException("Company validation status must be APPROVED or REJECTED");
        }

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found with id: " + id));
        company.setValidationStatus(request.validationStatus());
        Company savedCompany = companyRepository.save(company);

        adminLogRepository.save(AdminLog.builder()
                .adminId(admin.getId())
                .action("VALIDATE_COMPANY")
                .targetType("Company")
                .targetId(savedCompany.getId())
                .description(resolveDescription(request, savedCompany))
                .build());

        notificationService.create(
                savedCompany.getRecruiterId(),
                "Company validation updated",
                "Your company " + savedCompany.getName() + " has been " + savedCompany.getValidationStatus().name().toLowerCase() + ".",
                NotificationType.ADMIN);

        return toResponse(savedCompany);
    }

    private String resolveDescription(CompanyValidationRequest request, Company company) {
        if (request.description() != null && !request.description().isBlank()) {
            return request.description();
        }
        return "Company " + company.getName() + " validation status changed to " + company.getValidationStatus();
    }

    private CompanyResponse toResponse(Company company) {
        return new CompanyResponse(
                company.getId(),
                company.getRecruiterId(),
                company.getName(),
                company.getSector(),
                company.getSize(),
                company.getLocation(),
                company.getDescription(),
                company.getLogoUrl(),
                company.getWebsite(),
                company.getValidationStatus(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
