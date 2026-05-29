import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company, ValidationStatus } from '../../core/models/company.model';
import { CompanyService } from '../../core/services/company.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-companies', standalone: true, imports: [CommonModule, FormsModule, MaterialModule], templateUrl: './companies.component.html', styleUrl: './companies.component.scss' })
export class CompaniesComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly snackBar = inject(MatSnackBar);
  readonly companies = signal<Company[]>([]);
  status: ValidationStatus | '' = '';
  displayedColumns = ['name', 'sector', 'website', 'validationStatus', 'actions'];
  selected?: Company;
  filteredCompanies = computed(() => this.companies().filter((company) => !this.status || company.validationStatus === this.status));

  ngOnInit() { this.load(); }
  load() { this.companyService.getAdminCompanies().subscribe({ next: (companies) => this.companies.set(companies), error: () => this.snackBar.open('Could not load companies.', 'Close', { duration: 3000 }) }); }
  validate(company: Company, validationStatus: ValidationStatus) { this.companyService.validateCompany(company.id, validationStatus, `Company ${validationStatus.toLowerCase()} from backoffice`).subscribe({ next: () => this.load(), error: () => this.snackBar.open('Could not update company.', 'Close', { duration: 3000 }) }); }
}
