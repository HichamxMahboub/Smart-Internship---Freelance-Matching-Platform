import { Injectable, inject } from '@angular/core';
import { Notification, NotificationsOverview } from '../models/notification.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);

  getAdminOverview() {
    return this.api.get<NotificationsOverview>('/admin/notifications');
  }

  markRead(id: string) {
    return this.api.patch<Notification>(`/notifications/${id}/read`);
  }

  markAllRead() {
    return this.api.patch<Notification[]>('/notifications/read-all');
  }
}
