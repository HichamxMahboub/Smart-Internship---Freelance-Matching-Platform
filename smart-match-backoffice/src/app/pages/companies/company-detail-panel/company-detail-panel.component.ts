import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Company, ValidationStatus } from '../../../core/models/company.model';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-company-detail-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './company-detail-panel.component.html',
  styleUrl: './company-detail-panel.component.scss'
})
export class CompanyDetailPanelComponent {
  readonly company = input.required<Company>();

  readonly closed = output<void>();
  readonly approve = output<Company>();
  readonly reject = output<Company>();

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

  shortId(id: string): string {
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}…${id.slice(-4)}`;
  }
}
