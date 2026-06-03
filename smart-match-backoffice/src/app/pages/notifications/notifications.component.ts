import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AdminNotificationItem,
  NotificationFilterType,
  NotificationInboxSummary,
  NotificationReadFilter,
  NotificationType
} from '../../core/models/notification.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MaterialModule } from '../../shared/material/material.module';

interface NotificationGroup {
  label: string;
  items: AdminNotificationItem[];
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly allNotifications = signal<AdminNotificationItem[]>([]);
  readonly summary = signal<NotificationInboxSummary | undefined>(undefined);
  readonly loading = signal(true);

  typeFilter: NotificationFilterType = 'ALL';
  readFilter: NotificationReadFilter = 'ALL';
  search = '';

  readonly filteredNotifications = computed(() => {
    const query = this.search.trim().toLowerCase();
    const currentUserId = this.auth.currentUser?.id;
    return this.allNotifications().filter((item) => {
      if (this.typeFilter !== 'ALL' && item.type !== this.typeFilter) return false;
      if (this.readFilter === 'UNREAD' && item.read) return false;
      if (this.readFilter === 'MINE_UNREAD' && (item.read || item.userId !== currentUserId)) return false;
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.recipientName.toLowerCase().includes(query) ||
        item.recipientEmail.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    });
  });

  readonly groupedNotifications = computed(() => this.groupByDate(this.filteredNotifications()));

  readonly hasMineUnread = computed(() => (this.summary()?.mineUnread ?? 0) > 0);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.notificationService.getAdminOverview().subscribe({
      next: (overview) => {
        this.summary.set(overview.summary);
        this.allNotifications.set(overview.notifications ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Could not load notifications.', 'Close', { duration: 3000 });
      }
    });
  }

  markRead(item: AdminNotificationItem) {
    if (item.read) return;
    if (!this.isMine(item)) {
      this.snackBar.open('You can only mark your own notifications as read.', 'Close', { duration: 3000 });
      return;
    }
    this.notificationService.markRead(item.id).subscribe({
      next: () => this.load(),
      error: () => this.snackBar.open('Could not update notification.', 'Close', { duration: 3000 })
    });
  }

  markAllMineRead() {
    if (!this.hasMineUnread()) {
      this.snackBar.open('No unread notifications for your account.', 'Close', { duration: 2500 });
      return;
    }
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Your notifications marked as read.', 'Close', { duration: 2500 });
      },
      error: () => this.snackBar.open('Could not mark notifications as read.', 'Close', { duration: 3000 })
    });
  }

  setTypeFilter(type: NotificationFilterType) {
    this.typeFilter = type;
  }

  setReadFilter(filter: NotificationReadFilter) {
    this.readFilter = filter;
  }

  isMine(item: AdminNotificationItem): boolean {
    return item.userId === this.auth.currentUser?.id;
  }

  typeIcon(type: NotificationType): string {
    switch (type) {
      case 'APPLICATION':
        return 'assignment';
      case 'OFFER':
        return 'work';
      case 'SUBSCRIPTION':
        return 'workspace_premium';
      case 'AI':
        return 'auto_awesome';
      default:
        return 'admin_panel_settings';
    }
  }

  typeLabel(type: NotificationType): string {
    switch (type) {
      case 'APPLICATION':
        return 'Application';
      case 'OFFER':
        return 'Offer';
      case 'SUBSCRIPTION':
        return 'Subscription';
      case 'AI':
        return 'AI';
      default:
        return 'Admin';
    }
  }

  typeClass(type: NotificationType): string {
    return `notif-card--${type.toLowerCase()}`;
  }

  roleClass(role?: string): string {
    if (!role) return 'notif-recipient__role--unknown';
    return `notif-recipient__role--${role.toLowerCase()}`;
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  relativeTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  private groupByDate(items: AdminNotificationItem[]): NotificationGroup[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups = new Map<string, AdminNotificationItem[]>();
    for (const item of items) {
      const label = this.groupLabel(item.createdAt, today, yesterday);
      const bucket = groups.get(label) ?? [];
      bucket.push(item);
      groups.set(label, bucket);
    }

    const order = ['Today', 'Yesterday', 'Earlier this week', 'Older'];
    const result: NotificationGroup[] = [];
    for (const label of order) {
      const bucket = groups.get(label);
      if (bucket?.length) result.push({ label, items: bucket });
    }
    for (const [label, bucket] of groups.entries()) {
      if (!order.includes(label) && bucket.length) {
        result.push({ label, items: bucket });
      }
    }
    return result;
  }

  private groupLabel(value: string | undefined, today: Date, yesterday: Date): string {
    if (!value) return 'Older';
    const date = new Date(value);
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    if (day.getTime() === today.getTime()) return 'Today';
    if (day.getTime() === yesterday.getTime()) return 'Yesterday';
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (day > weekAgo) return 'Earlier this week';
    return 'Older';
  }
}
