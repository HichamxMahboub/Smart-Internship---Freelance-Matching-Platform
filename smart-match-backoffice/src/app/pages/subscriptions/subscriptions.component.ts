import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from '../../core/models/subscription.model';
import { SubscriptionService } from '../../core/services/subscription.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-subscriptions', standalone: true, imports: [CommonModule, MaterialModule], templateUrl: './subscriptions.component.html', styleUrl: './subscriptions.component.scss' })
export class SubscriptionsComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly snackBar = inject(MatSnackBar);
  readonly subscriptions = signal<Subscription[]>([]);
  displayedColumns = ['userId', 'plan', 'status', 'active', 'expirationDate'];
  ngOnInit() { this.subscriptionService.getAdminSubscriptions().subscribe({ next: (items) => this.subscriptions.set(items), error: () => this.snackBar.open('Could not load subscriptions.', 'Close', { duration: 3000 }) }); }
}
