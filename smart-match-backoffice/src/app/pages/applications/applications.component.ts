import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationOverview, ApplicationStatus } from '../../core/models/application.model';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss'
})
export class ApplicationsComponent implements OnInit {
  private readonly applicationService = inject(ApplicationService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly applications = signal<ApplicationOverview[]>([]);
  readonly statusFilter = signal<'ALL' | ApplicationStatus>('ALL');
  readonly loading = signal(true);

  search = '';

  readonly stats = computed(() => {
    const items = this.applications();
    return {
      total: items.length,
      pending: items.filter((a) => a.status === 'PENDING').length,
      interview: items.filter((a) => a.status === 'INTERVIEW').length,
      accepted: items.filter((a) => a.status === 'ACCEPTED').length,
      rejected: items.filter((a) => a.status === 'REJECTED').length
    };
  });

  readonly filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    const status = this.statusFilter();
    return this.applications().filter((a) => {
      if (status !== 'ALL' && a.status !== status) return false;
      if (!term) return true;
      const blob = `${a.candidateName ?? ''} ${a.candidateEmail ?? ''} ${a.offerTitle ?? ''} ${a.recruiterName ?? ''} ${a.companyName ?? ''}`.toLowerCase();
      return blob.includes(term);
    });
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.applicationService.getAdminApplicationsOverview().subscribe({
      next: (apps) => { this.applications.set(apps); this.loading.set(false); },
      error: () => { this.loading.set(false); this.snackBar.open('Could not load applications.', 'Close', { duration: 3000 }); }
    });
  }

  setStatusFilter(value: 'ALL' | ApplicationStatus) {
    this.statusFilter.set(value);
  }

  initials(name?: string): string {
    if (!name) return '?';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  statusLabel(status: ApplicationStatus): string {
    if (status === 'PENDING') return 'Pending review';
    if (status === 'INTERVIEW') return 'Interview';
    if (status === 'ACCEPTED') return 'Accepted';
    return 'Rejected';
  }

  statusTone(status: ApplicationStatus): string {
    if (status === 'PENDING') return 'tone--pending';
    if (status === 'INTERVIEW') return 'tone--interview';
    if (status === 'ACCEPTED') return 'tone--accepted';
    return 'tone--rejected';
  }
}
