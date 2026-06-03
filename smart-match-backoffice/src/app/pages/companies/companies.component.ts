import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company, ValidationStatus } from '../../core/models/company.model';
import { CompanyService } from '../../core/services/company.service';
import { MaterialModule } from '../../shared/material/material.module';
import { CompanyDetailPanelComponent } from './company-detail-panel/company-detail-panel.component';
import { CompanyDetailPlaceholderComponent } from './company-detail-placeholder/company-detail-placeholder.component';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    CompanyDetailPanelComponent,
    CompanyDetailPlaceholderComponent
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly snackBar = inject(MatSnackBar);

  readonly companies = signal<Company[]>([]);
  readonly selected = signal<Company | undefined>(undefined);

  status: ValidationStatus | '' = '';
  displayedColumns = ['name'];

  filteredCompanies = computed(() =>
    this.companies().filter((company) => !this.status || company.validationStatus === this.status)
  );

  ngOnInit() {
    this.load();
  }

  load() {
    this.companyService.getAdminCompanies().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        const current = this.selected();
        if (current) {
          this.selected.set(companies.find((company) => company.id === current.id) ?? undefined);
        }
      },
      error: () => this.snackBar.open('Could not load companies.', 'Close', { duration: 3000 })
    });
  }

  selectCompany(company: Company) {
    this.selected.set(company);
  }

  clearSelection() {
    this.selected.set(undefined);
  }

  isSelected(company: Company): boolean {
    return this.selected()?.id === company.id;
  }

  validate(company: Company, validationStatus: ValidationStatus) {
    this.companyService
      .validateCompany(company.id, validationStatus, `Company ${validationStatus.toLowerCase()} from backoffice`)
      .subscribe({
        next: (updated) => {
          this.selected.set(updated);
          this.load();
          this.snackBar.open(`Company ${validationStatus.toLowerCase()}.`, 'Close', { duration: 2500 });
        },
        error: () => this.snackBar.open('Could not update company.', 'Close', { duration: 3000 })
      });
  }
}
