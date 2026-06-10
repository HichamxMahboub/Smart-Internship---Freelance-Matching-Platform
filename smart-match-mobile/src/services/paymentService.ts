import { apiClient } from '../api/apiClient';
import { CheckoutSession, Payment } from '../types';

export const paymentService = {
  /** Payments the current user funded (subscriptions + freelance payouts). */
  async mine() { const { data } = await apiClient.get<Payment[]>('/payments/me'); return data; },
  /** Freelance payments the current candidate received. */
  async earnings() { const { data } = await apiClient.get<Payment[]>('/payments/earnings'); return data; },
  /** Recruiter starts a Stripe Checkout to pay a candidate for a freelance mission. */
  async freelanceCheckout(applicationId: string, amount: number, currency?: string, note?: string) {
    const { data } = await apiClient.post<CheckoutSession>('/payments/freelance/checkout', { applicationId, amount, currency, note });
    return data;
  },
  /** Start a Stripe Checkout to buy 30 days of Premium. */
  async subscriptionCheckout() {
    const { data } = await apiClient.post<CheckoutSession>('/payments/subscription/checkout', {});
    return data;
  },
  /** Re-read the Stripe session and mark the payment paid if Stripe confirms it. Call on return from Checkout. */
  async confirm(paymentId: string) { const { data } = await apiClient.post<Payment>(`/payments/${paymentId}/confirm`, {}); return data; }
};
