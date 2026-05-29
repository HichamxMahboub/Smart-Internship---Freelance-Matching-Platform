import { apiClient } from '../api/apiClient';
import { Subscription } from '../types';
export const subscriptionService = {
  async current() { const { data } = await apiClient.get<Subscription>('/subscriptions/me'); return data; },
  async upgrade() { const { data } = await apiClient.post('/subscriptions/upgrade', { paymentMethod: 'SIMULATED_MOBILE' }); return data; }
};
