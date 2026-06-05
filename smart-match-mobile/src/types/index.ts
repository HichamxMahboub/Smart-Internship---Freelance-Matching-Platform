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
export interface Company { id: string; recruiterId: string; name: string; sector?: string; size?: string; location?: string; description?: string; logoUrl?: string; website?: string; validationStatus: ValidationStatus; createdAt?: string; updatedAt?: string; }
export interface Offer { id: string; companyId: string; title: string; description: string; type: OfferType; location?: string; duration?: string; requiredSkills: string[]; status: OfferStatus; publishedAt?: string; archiveAt?: string; createdAt?: string; updatedAt?: string; }
export interface OfferPayload { title: string; description: string; type: OfferType; location?: string; duration?: string; requiredSkills: string[]; }
export interface Application { id: string; offerId: string; candidateId: string; recruiterId: string; message?: string; status: ApplicationStatus; matchingScore?: number; meetingLink?: string; appliedAt?: string; reviewedAt?: string; decidedAt?: string; updatedAt?: string; }

/** One AI match result from the assistant matchers (offer fields for candidates, candidate fields for recruiters). */
export interface MatchItem { offerId?: string; candidateId?: string; title?: string; name?: string; company?: string; type?: string; headline?: string; score?: number; reasons?: string[]; gaps?: string[]; }
export interface SkillLevel { name: string; level: number; }
export interface Favorite { id: string; userId: string; offerId: string; offer?: Offer; createdAt?: string; }
export interface Subscription { id?: string; userId: string; plan: Plan; active: boolean; startDate?: string; expirationDate?: string; status?: SubscriptionStatus; createdAt?: string; updatedAt?: string; }
export interface Notification { id: string; userId: string; title: string; message: string; type: NotificationType; read: boolean; createdAt?: string; }
export interface RecruiterProfile { id?: string; userId?: string; companyId?: string; photoUrl?: string; headline?: string; bio?: string; linkedin?: string; position?: string; phone?: string; createdAt?: string; updatedAt?: string; }
export interface Project { id?: string; title: string; description?: string; link?: string; imageUrl?: string; }
export interface Experience { id?: string; role: string; org: string; start?: string; end?: string; current?: boolean; description?: string; }
export interface Education { id?: string; school: string; degree?: string; field?: string; start?: string; end?: string; }
export interface SocialLinks { github?: string; linkedin?: string; website?: string; other?: string; }
export interface CandidateProfile {
  id?: string;
  userId?: string;
  photoUrl?: string;
  headline?: string;
  bio?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  location?: string;
  cvUrl?: string;
  skills: string[];
  skillLevels?: SkillLevel[];
  languages: string[];
  preferences: string[];
  projects?: Project[];
  experiences?: Experience[];
  educations?: Education[];
  socials?: SocialLinks;
}
export interface OfferMatch { score: number; matched: string[]; missing: string[]; }
export interface AIResult { id: string; userId: string; offerId?: string; applicationId?: string; type: AIResultType; score?: number; extractedSkills: string[]; skillLevels?: SkillLevel[]; profileType?: string; primaryStack?: string; seniority?: string; recommendation?: string; conclusion?: string; details?: string; createdAt?: string; }
export interface Conversation {
  id: string;
  candidateId: string;
  recruiterId: string;
  offerId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread: number;
  createdAt?: string;
  displayName?: string;
  displayAvatarUrl?: string;
  offerTitle?: string;
  companyName?: string;
}
export interface Message { id: string; conversationId: string; senderId: string; content: string; read: boolean; createdAt?: string; }
export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }
