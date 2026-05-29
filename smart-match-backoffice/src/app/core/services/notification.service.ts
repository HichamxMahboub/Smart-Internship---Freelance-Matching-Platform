import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  list() { return this.api.get<Notification[]>('/notifications'); }
  markRead(id: string) { return this.api.patch<Notification>(`/notifications/${id}/read`); }
  markAllRead() { return this.api.patch<Notification[]>('/notifications/read-all'); }
}
