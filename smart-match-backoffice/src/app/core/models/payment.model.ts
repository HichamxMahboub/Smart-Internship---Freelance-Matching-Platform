export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt?: string;
}
