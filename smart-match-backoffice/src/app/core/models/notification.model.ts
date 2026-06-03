import { Role } from './user.model';

export type NotificationType = 'APPLICATION' | 'OFFER' | 'SUBSCRIPTION' | 'AI' | 'ADMIN';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt?: string;
}

export interface AdminNotificationItem extends Notification {
  recipientName: string;
  recipientEmail: string;
  recipientRole?: Role;
}

export interface NotificationInboxSummary {
  total: number;
  unread: number;
  mineUnread: number;
  applicationCount: number;
  offerCount: number;
  subscriptionCount: number;
  aiCount: number;
  adminCount: number;
}

export interface NotificationsOverview {
  summary: NotificationInboxSummary;
  notifications: AdminNotificationItem[];
}

export type NotificationFilterType = NotificationType | 'ALL';
export type NotificationReadFilter = 'ALL' | 'UNREAD' | 'MINE_UNREAD';
