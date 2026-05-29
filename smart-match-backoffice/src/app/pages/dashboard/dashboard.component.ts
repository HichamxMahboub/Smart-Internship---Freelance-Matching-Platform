import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminDashboard } from '../../core/models/admin-dashboard.model';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-dashboard', standalone: true, imports: [CommonModule, MaterialModule], templateUrl: './dashboard.component.html', styleUrl: './dashboard.component.scss' })
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);
  data?: AdminDashboard;
  loading = false;

  cards = [
    ['totalUsers', 'Total users', 'group'], ['totalCandidates', 'Candidates', 'school'], ['totalRecruiters', 'Recruiters', 'business_center'],
    ['totalOffers', 'Offers', 'work'], ['totalApplications', 'Applications', 'assignment'], ['totalPremiumUsers', 'Premium users', 'workspace_premium'],
    ['totalCompanies', 'Companies', 'apartment'], ['pendingCompanies', 'Pending companies', 'pending_actions'], ['publishedOffers', 'Published offers', 'campaign'], ['pendingApplications', 'Pending applications', 'hourglass_empty']
  ] as const;

  ngOnInit() {
    if (this.auth.currentUser?.role !== 'ADMIN') return;
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (data) => { this.data = data; this.loading = false; },
      error: () => { this.loading = false; this.snackBar.open('Could not load dashboard.', 'Close', { duration: 3500 }); }
    });
  }
}
