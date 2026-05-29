import { apiClient } from '../api/apiClient';
import { Favorite } from '../types';
export const favoriteService = {
  async list() { const { data } = await apiClient.get<Favorite[]>('/favorites/me'); return data; },
  async add(offerId: string) { const { data } = await apiClient.post<Favorite>(`/favorites/${offerId}`); return data; },
  async remove(offerId: string) { await apiClient.delete(`/favorites/${offerId}`); }
};
