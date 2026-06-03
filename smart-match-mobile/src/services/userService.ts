import { apiClient } from '../api/apiClient';
import { User } from '../types';
export const userService = {
  async me() { const { data } = await apiClient.get<User>('/users/me'); return data; },
  async updateMe(payload: { fullName: string }) { const { data } = await apiClient.put<User>('/users/me', payload); return data; },
  async updateFcmToken(fcmToken: string) { const { data } = await apiClient.put<User>('/users/me/fcm-token', { fcmToken }); return data; },
  async refreshVerification() { const { data } = await apiClient.post<User>('/users/me/refresh-verification', {}); return data; }
};
