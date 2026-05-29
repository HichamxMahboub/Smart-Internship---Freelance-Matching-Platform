import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Subscription } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);
  getAdminSubscriptions() { return this.api.get<Subscription[]>('/admin/subscriptions'); }
}
