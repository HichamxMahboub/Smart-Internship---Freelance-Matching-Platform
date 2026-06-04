import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyOverview, ValidationStatus } from '../../core/models/company.model';
import { CompanyService } from '../../core/services/company.service';
import { MaterialModule } from '../../shared/material/material.module';
import { CompanyDetailPanelComponent } from './company-detail-panel/company-detail-panel.component';

type StatusFilter = ValidationStatus | 'ALL';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, CompanyDetailPanelComponent],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly snackBar = inject(MatSnackBar);

  readonly companies = signal<CompanyOverview[]>([]);
  readonly selectedId = signal<string | undefined>(undefined);
  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly search = signal('');
  readonly loading = signal(false);

  readonly totals = computed(() => {
    const list = this.companies();
    return {
      all: list.length,
      pending: list.filter((c) => c.validationStatus === 'PENDING').length,
      approved: list.filter((c) => c.validationStatus === 'APPROVED').length,
      rejected: list.filter((c) => c.validationStatus === 'REJECTED').length
    };
  });

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    const term = this.search().trim().toLowerCase();
    return this.companies()
      .filter((c) => status === 'ALL' || c.validationStatus === status)
      .filter((c) => {
        if (!term) return true;
        return (
          c.name.toLowerCase().includes(term) ||
          (c.sector ?? '').toLowerCase().includes(term) ||
          (c.recruiterName ?? '').toLowerCase().includes(term) ||
          (c.recruiterEmail ?? '').toLowerCase().includes(term) ||
          (c.location ?? '').toLowerCase().includes(term)
        );
      });
  });

  readonly selected = computed(() => this.companies().find((c) => c.id === this.selectedId()));

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.companyService.getAdminCompaniesOverview().subscribe({
      next: (companies) => {
        this.companies.set(companies);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Could not load companies.', 'Close', { duration: 3000 });
      }
    });
  }

  setStatus(status: StatusFilter) { this.statusFilter.set(status); }

  select(company: CompanyOverview) {
    this.selectedId.set(this.selectedId() === company.id ? undefined : company.id);
  }

  clearSelection() { this.selectedId.set(undefined); }

  validate(company: CompanyOverview, validationStatus: ValidationStatus) {
    this.companyService
      .validateCompany(company.id, validationStatus, `Company ${validationStatus.toLowerCase()} from backoffice`)
      .subscribe({
        next: () => {
          this.load();
          this.snackBar.open(`Company ${validationStatus.toLowerCase()}.`, 'Close', { duration: 2500 });
        },
        error: () => this.snackBar.open('Could not update company.', 'Close', { duration: 3000 })
      });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  statusClass(status: ValidationStatus): string {
    return `chip-${status.toLowerCase()}`;
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
