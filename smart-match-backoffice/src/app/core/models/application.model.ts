export type ApplicationStatus = 'PENDING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  offerId: string;
  candidateId: string;
  recruiterId: string;
  message?: string;
  status: ApplicationStatus;
  matchingScore?: number;
  appliedAt?: string;
  reviewedAt?: string;
  decidedAt?: string;
  updatedAt?: string;
}

export interface ApplicationOverview {
  id: string;
  offerId: string;
  offerTitle?: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  recruiterId?: string;
  recruiterName?: string;
  companyName?: string;
  message?: string;
  status: ApplicationStatus;
  matchingScore?: number;
  appliedAt?: string;
  reviewedAt?: string;
  decidedAt?: string;
  updatedAt?: string;
}
