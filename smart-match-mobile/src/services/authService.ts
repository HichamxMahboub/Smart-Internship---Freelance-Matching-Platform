import { apiClient } from '../api/apiClient';
import { Role, User } from '../types';

export const authService = {
  async syncUser(payload: { fullName: string; role: Role }) {
    const { data } = await apiClient.post<{ user: User; created: boolean }>('/auth/sync-user', payload);
    return data;
  },
  async me() {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  }
};
