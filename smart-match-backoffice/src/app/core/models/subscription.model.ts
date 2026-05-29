import { Plan } from './user.model';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  active: boolean;
  startDate?: string;
  expirationDate?: string;
  status: SubscriptionStatus;
  createdAt?: string;
  updatedAt?: string;
}
