import { apiClient } from '../api/apiClient';
import { User } from '../types';
export const userService = {
  async me() { const { data } = await apiClient.get<User>('/users/me'); return data; },
  async updateFcmToken(fcmToken: string) { const { data } = await apiClient.put<User>('/users/me/fcm-token', { fcmToken }); return data; }
};
