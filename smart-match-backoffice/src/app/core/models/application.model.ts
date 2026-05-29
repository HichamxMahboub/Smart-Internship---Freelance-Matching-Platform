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
  updatedAt?: string;
}
