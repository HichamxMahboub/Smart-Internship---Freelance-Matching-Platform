import { apiClient } from '../api/apiClient';
import { User } from '../types';
export const userService = { async me() { const { data } = await apiClient.get<User>('/users/me'); return data; } };
