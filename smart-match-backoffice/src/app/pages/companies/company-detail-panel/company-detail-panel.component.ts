import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { CompanyOverview, ValidationStatus } from '../../../core/models/company.model';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-company-detail-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './company-detail-panel.component.html',
  styleUrl: './company-detail-panel.component.scss'
})
export class CompanyDetailPanelComponent {
  readonly company = input.required<CompanyOverview>();

  readonly closed = output<void>();
  readonly approve = output<CompanyOverview>();
  readonly reject = output<CompanyOverview>();

  readonly canApprove = computed(() => this.company().validationStatus !== 'APPROVED');
  readonly canReject = computed(() => this.company().validationStatus !== 'REJECTED');

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
