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

export interface ExperienceEntry {
  role?: string;
  org?: string;
  start?: string;
  end?: string;
  current?: boolean;
  description?: string;
}

export interface EducationEntry {
  school?: string;
  degree?: string;
  field?: string;
  start?: string;
  end?: string;
}

export interface ProjectEntry {
  title?: string;
  description?: string;
  link?: string;
  tags?: string[];
}

export interface SocialLinksDto {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface SkillLevelDto {
  name: string;
  level: number;
}

export interface CandidateProfileDto {
  id?: string;
  userId: string;
  photoUrl?: string;
  headline?: string;
  bio?: string;
  educationLevel?: string;
  fieldOfStudy?: string;
  location?: string;
  cvUrl?: string;
  skills?: string[];
  skillLevels?: SkillLevelDto[];
  languages?: string[];
  preferences?: string[];
  projects?: ProjectEntry[];
  experiences?: ExperienceEntry[];
  educations?: EducationEntry[];
  socials?: SocialLinksDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterProfileDto {
  id?: string;
  userId: string;
  companyId?: string;
  photoUrl?: string;
  headline?: string;
  bio?: string;
  linkedin?: string;
  position?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyDto {
  id?: string;
  recruiterId?: string;
  name?: string;
  sector?: string;
  size?: string;
  location?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  validationStatus?: 'PENDING' | 'VALIDATED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
}

export type AIResultType = 'CV_ANALYSIS' | 'OFFER_RECOMMENDATION' | 'CANDIDATE_RECOMMENDATION' | 'PROFILE_OPTIMIZATION';

export interface AIResultDto {
  id?: string;
  userId?: string;
  offerId?: string;
  applicationId?: string;
  type: AIResultType;
  score?: number;
  extractedSkills?: string[];
  skillLevels?: SkillLevelDto[];
  profileType?: string;
  primaryStack?: string;
  seniority?: string;
  recommendation?: string;
  conclusion?: string;
  details?: string;
  createdAt?: string;
}

export interface UserDetail {
  user: User;
  candidateProfile?: CandidateProfileDto;
  recruiterProfile?: RecruiterProfileDto;
  company?: CompanyDto;
  aiResults: AIResultDto[];
}

export interface UserOverview {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  plan: Plan;
  active: boolean;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  photoUrl?: string;
  headline?: string;
  location?: string;
  cvUrl?: string;
  skillCount?: number;
  languageCount?: number;
  experienceCount?: number;
  educationCount?: number;
  projectCount?: number;
  aiResultCount?: number;
  cvScore?: number;
  companyName?: string;
  companyLogoUrl?: string;
}
