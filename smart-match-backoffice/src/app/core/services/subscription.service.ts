import { Injectable, inject } from '@angular/core';
import { SubscriptionsOverview } from '../models/subscription.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);

  getAdminOverview() {
    return this.api.get<SubscriptionsOverview>('/admin/subscriptions');
  }
}
