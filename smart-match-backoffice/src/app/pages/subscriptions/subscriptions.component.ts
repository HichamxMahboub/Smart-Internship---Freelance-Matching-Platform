import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AdminSubscriptionItem,
  RevenueMonthPoint,
  SubscriptionRevenueSummary,
  SubscriptionsOverview
} from '../../core/models/subscription.model';
import { Role } from '../../core/models/user.model';
import { SubscriptionService } from '../../core/services/subscription.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly snackBar = inject(MatSnackBar);

  readonly subscriptions = signal<AdminSubscriptionItem[]>([]);
  readonly revenue = signal<SubscriptionRevenueSummary | undefined>(undefined);
  readonly loading = signal(true);

  readonly chartMax = computed(() => {
    const points = this.revenue()?.byMonth ?? [];
    const max = Math.max(...points.map((point) => point.amount), 0);
    return max > 0 ? max : 1;
  });

  displayedColumns = ['user', 'plan', 'status', 'billing', 'period'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.subscriptionService.getAdminOverview().subscribe({
      next: (overview: SubscriptionsOverview) => {
        this.revenue.set(overview.revenue);
        this.subscriptions.set(overview.subscriptions ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Could not load subscriptions.', 'Close', { duration: 3000 });
      }
    });
  }

  formatMoney(value: number | undefined, currency = 'MAD'): string {
    const amount = value ?? 0;
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  }

  barHeight(point: RevenueMonthPoint): string {
    const max = this.chartMax();
    const ratio = point.amount / max;
    return `${Math.max(ratio * 100, point.amount > 0 ? 8 : 4)}%`;
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  roleClass(role?: Role): string {
    if (!role) return 'sub-user__role--unknown';
    return `sub-user__role--${role.toLowerCase()}`;
  }

  statusClass(status: string): string {
    return `chip-${status.toLowerCase()}`;
  }

  daysUntilExpiry(expirationDate?: string): string {
    if (!expirationDate) return '—';
    const expiry = new Date(expirationDate);
    const diffMs = expiry.getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  }
}
