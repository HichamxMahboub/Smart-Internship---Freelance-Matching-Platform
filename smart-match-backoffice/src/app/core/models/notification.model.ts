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
