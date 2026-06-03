import { Plan, Role } from './user.model';

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

export interface AdminSubscriptionItem extends Subscription {
  userFullName: string;
  userEmail: string;
  userRole?: Role;
  lastPaymentAmount?: number;
  lastPaymentCurrency?: string;
  lastPaymentAt?: string;
}

export interface RevenueMonthPoint {
  month: string;
  label: string;
  amount: number;
  paymentCount: number;
}

export interface SubscriptionRevenueSummary {
  totalRevenue: number;
  revenueThisMonth: number;
  estimatedMrr: number;
  currency: string;
  activeSubscriptions: number;
  premiumUsers: number;
  totalPayments: number;
  byMonth: RevenueMonthPoint[];
}

export interface SubscriptionsOverview {
  revenue: SubscriptionRevenueSummary;
  subscriptions: AdminSubscriptionItem[];
}
