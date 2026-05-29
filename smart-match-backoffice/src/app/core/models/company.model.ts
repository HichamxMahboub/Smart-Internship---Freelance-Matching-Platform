export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Company {
  id: string;
  recruiterId: string;
  name: string;
  sector?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  validationStatus: ValidationStatus;
  createdAt?: string;
  updatedAt?: string;
}
