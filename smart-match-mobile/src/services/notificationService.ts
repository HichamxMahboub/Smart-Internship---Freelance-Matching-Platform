import { apiClient } from '../api/apiClient';
import { Notification } from '../types';
export const notificationService = {
  async list() { const { data } = await apiClient.get<Notification[]>('/notifications'); return data; },
  async markRead(id: string) { const { data } = await apiClient.patch<Notification>(`/notifications/${id}/read`); return data; },
  async markAllRead() { const { data } = await apiClient.patch<Notification[]>('/notifications/read-all'); return data; }
};
