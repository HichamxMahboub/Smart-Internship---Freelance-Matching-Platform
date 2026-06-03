import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminDashboard } from '../../core/models/admin-dashboard.model';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { MaterialModule } from '../../shared/material/material.module';

type DashboardKey = keyof Omit<AdminDashboard, 'generatedAt'>;

interface MetricCard {
  key: DashboardKey;
  label: string;
  icon: string;
  tone: 'blue' | 'teal' | 'gold' | 'coral' | 'purple';
  hint: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);
  data?: AdminDashboard;
  loading = false;

  readonly cards: MetricCard[] = [
    { key: 'totalUsers', label: 'Total users', icon: 'group', tone: 'blue', hint: 'Everyone on the platform' },
    { key: 'totalCandidates', label: 'Candidates', icon: 'school', tone: 'teal', hint: 'Talent ready to match' },
    { key: 'totalRecruiters', label: 'Recruiters', icon: 'business_center', tone: 'purple', hint: 'Hiring teams onboarded' },
    { key: 'totalOffers', label: 'Offers', icon: 'work', tone: 'blue', hint: 'Internship & freelance posts' },
    { key: 'totalApplications', label: 'Applications', icon: 'assignment', tone: 'coral', hint: 'Candidate submissions' },
    { key: 'totalPremiumUsers', label: 'Premium users', icon: 'workspace_premium', tone: 'gold', hint: 'AI matching subscribers' },
    { key: 'totalCompanies', label: 'Companies', icon: 'apartment', tone: 'teal', hint: 'Company profiles created' },
    { key: 'pendingCompanies', label: 'Pending companies', icon: 'pending_actions', tone: 'gold', hint: 'Need admin review' },
    { key: 'publishedOffers', label: 'Published offers', icon: 'campaign', tone: 'purple', hint: 'Visible opportunities' },
    { key: 'pendingApplications', label: 'Pending applications', icon: 'hourglass_empty', tone: 'coral', hint: 'Waiting for decisions' }
  ];

  ngOnInit() {
    if (this.auth.currentUser?.role !== 'ADMIN') return;
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => { this.data = data; this.loading = false; },
      error: () => {
        this.loading = false;
        this.snackBar.open('Could not load dashboard.', 'Close', { duration: 3500 });
      }
    });
  }

  value(key: DashboardKey) {
    return this.data?.[key] ?? 0;
  }

  get activeOpportunities() {
    return this.value('publishedOffers') + this.value('pendingApplications');
  }

  get reviewQueue() {
    return this.value('pendingCompanies') + this.value('pendingApplications');
  }

  get premiumShare() {
    const users = this.value('totalUsers');
    return users ? Math.round((this.value('totalPremiumUsers') / users) * 100) : 0;
  }
}
