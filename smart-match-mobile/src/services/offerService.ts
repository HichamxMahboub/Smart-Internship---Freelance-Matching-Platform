import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/apiClient';
import { Offer, OfferPayload, OfferStatus, OfferType, PageResponse } from '../types';

const OFFER_CACHE_KEY = 'smart-match:last-offers';

export const offerService = {
  async list(params: { keyword?: string; type?: OfferType | ''; location?: string; skill?: string; status?: OfferStatus | ''; page?: number; size?: number }) {
    try {
      const { data } = await apiClient.get<PageResponse<Offer>>('/offers', { params });
      await AsyncStorage.setItem(OFFER_CACHE_KEY, JSON.stringify(data.content ?? []));
      return { offers: data.content ?? [], offline: false };
    } catch (error) {
      const cached = await AsyncStorage.getItem(OFFER_CACHE_KEY);
      if (cached) return { offers: JSON.parse(cached) as Offer[], offline: true };
      throw error;
    }
  },
  async get(id: string) { const { data } = await apiClient.get<Offer>(`/offers/${id}`); return data; },
  async create(payload: OfferPayload) { const { data } = await apiClient.post<Offer>('/offers', payload); return data; },
  async update(id: string, payload: OfferPayload) { const { data } = await apiClient.put<Offer>(`/offers/${id}`, payload); return data; },
  async remove(id: string) { await apiClient.delete(`/offers/${id}`); },
  async publish(id: string) { const { data } = await apiClient.patch<Offer>(`/offers/${id}/publish`); return data; },
  async archive(id: string) { const { data } = await apiClient.patch<Offer>(`/offers/${id}/archive`); return data; }
};
