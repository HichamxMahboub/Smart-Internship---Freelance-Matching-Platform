export type Role = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
export type Plan = 'FREE' | 'PREMIUM';
export type OfferType = 'INTERNSHIP' | 'FREELANCE';
export type OfferStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'BLOCKED';
export type ApplicationStatus = 'PENDING' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type NotificationType = 'APPLICATION' | 'OFFER' | 'SUBSCRIPTION' | 'AI' | 'ADMIN';
export type AIResultType = 'CV_ANALYSIS' | 'OFFER_RECOMMENDATION' | 'CANDIDATE_RECOMMENDATION' | 'PROFILE_OPTIMIZATION';

export interface User { id: string; firebaseUid?: string; fullName: string; email: string; role: Role; plan: Plan; active: boolean; emailVerified: boolean; createdAt?: string; updatedAt?: string; }
export interface Company { id: string; recruiterId: string; name: string; sector?: string; description?: string; logoUrl?: string; website?: string; validationStatus: ValidationStatus; createdAt?: string; updatedAt?: string; }
export interface Offer { id: string; companyId: string; title: string; description: string; type: OfferType; location?: string; duration?: string; requiredSkills: string[]; status: OfferStatus; publishedAt?: string; archiveAt?: string; createdAt?: string; updatedAt?: string; }
export interface OfferPayload { title: string; description: string; type: OfferType; location?: string; duration?: string; requiredSkills: string[]; }
export interface Application { id: string; offerId: string; candidateId: string; recruiterId: string; message?: string; status: ApplicationStatus; matchingScore?: number; appliedAt?: string; updatedAt?: string; }
export interface Favorite { id: string; userId: string; offerId: string; offer?: Offer; createdAt?: string; }
export interface Subscription { id?: string; userId: string; plan: Plan; active: boolean; startDate?: string; expirationDate?: string; status?: SubscriptionStatus; createdAt?: string; updatedAt?: string; }
export interface Notification { id: string; userId: string; title: string; message: string; type: NotificationType; read: boolean; createdAt?: string; }
export interface RecruiterProfile { id?: string; userId?: string; companyId?: string; position?: string; phone?: string; createdAt?: string; updatedAt?: string; }
export interface CandidateProfile { id?: string; userId?: string; educationLevel?: string; fieldOfStudy?: string; location?: string; cvUrl?: string; skills: string[]; languages: string[]; preferences: string[]; }
export interface AIResult { id: string; userId: string; offerId?: string; applicationId?: string; type: AIResultType; score?: number; extractedSkills: string[]; recommendation?: string; details?: string; createdAt?: string; }
export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
