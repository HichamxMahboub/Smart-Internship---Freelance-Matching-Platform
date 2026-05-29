export type Role = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
export type Plan = 'FREE' | 'PREMIUM';

export interface User {
  id: string;
  firebaseUid?: string;
  fullName: string;
  email: string;
  role: Role;
  plan: Plan;
  active: boolean;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}
