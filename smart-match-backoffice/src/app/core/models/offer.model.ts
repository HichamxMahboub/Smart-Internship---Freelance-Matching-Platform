export type OfferType = 'INTERNSHIP' | 'FREELANCE';
export type OfferStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'BLOCKED';

export interface Offer {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: OfferType;
  location?: string;
  duration?: string;
  requiredSkills: string[];
  status: OfferStatus;
  publishedAt?: string;
  archiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
  companyName?: string;
  companyLogoUrl?: string;
  companySector?: string;
  applicationCount?: number;
}

export interface OfferPayload {
  title: string;
  description: string;
  type: OfferType;
  location?: string;
  duration?: string;
  requiredSkills: string[];
}
