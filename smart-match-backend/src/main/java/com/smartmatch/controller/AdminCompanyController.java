package com.smartmatch.controller;

import com.smartmatch.dto.company.CompanyResponse;
import com.smartmatch.dto.company.CompanyValidationRequest;
import com.smartmatch.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCompanyController {
    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @PatchMapping("/{id}/validate")
    public ResponseEntity<CompanyResponse> validateCompany(@PathVariable String id,
                                                           @Valid @RequestBody CompanyValidationRequest request) {
        return ResponseEntity.ok(companyService.validateCompany(id, request));
    }
}
