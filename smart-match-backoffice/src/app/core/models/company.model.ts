export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Company {
  id: string;
  recruiterId: string;
  name: string;
  sector?: string;
  size?: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  validationStatus: ValidationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyOverview extends Company {
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhotoUrl?: string;
  offerCount: number;
  publishedOfferCount: number;
}
