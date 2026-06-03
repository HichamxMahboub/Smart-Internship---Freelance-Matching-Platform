package com.smartmatch.service;

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
import com.smartmatch.repository.RecruiterProfileRepository;
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

    public CompanyResponse createCompany(CompanyRequest request) {
        User recruiter = SecurityUtils.currentUser();
        if (companyRepository.findByRecruiterId(recruiter.getId()).isPresent()) {
            throw new ConflictException("Recruiter already has a company");
        }

        Company company = Company.builder()
                .recruiterId(recruiter.getId())
                .name(request.name())
                .sector(request.sector())
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
                company.getDescription(),
                company.getLogoUrl(),
                company.getWebsite(),
                company.getValidationStatus(),
                company.getCreatedAt(),
                company.getUpdatedAt()
        );
    }
}
