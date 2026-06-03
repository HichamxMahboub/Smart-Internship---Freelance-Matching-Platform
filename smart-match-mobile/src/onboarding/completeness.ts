import { CandidateProfile, Company } from '../types';

/**
 * A candidate profile counts as "onboarded" once it carries the essentials the
 * matching engine needs: a headline, at least one skill, and a CV reference.
 */
export function isCandidateComplete(p?: CandidateProfile | null): boolean {
  if (!p) return false;
  return Boolean(p.headline?.trim()) && (p.skills?.length ?? 0) > 0 && Boolean(p.cvUrl?.trim());
}

/** First onboarding step that still needs data (used to resume after sign-in). */
export function candidateOnboardingStep(p?: CandidateProfile | null): number {
  if (!p?.headline?.trim()) return 0;
  if ((p.skills?.length ?? 0) === 0) return 2;
  if (!p.cvUrl?.trim()) return 3;
  return 3;
}

export function normalizeCandidateProfile(p: CandidateProfile): CandidateProfile {
  return {
    ...p,
    skills: p.skills ?? [],
    languages: p.languages ?? [],
    preferences: p.preferences ?? []
  };
}

/** Weighted completeness 0–100 for the profile meter (more = richer profile). */
export function candidateCompletion(p?: CandidateProfile | null): number {
  if (!p) return 0;
  const checks: boolean[] = [
    Boolean(p.photoUrl?.trim()),
    Boolean(p.headline?.trim()),
    Boolean(p.bio?.trim()),
    Boolean(p.educationLevel?.trim()) || (p.educations?.length ?? 0) > 0,
    Boolean(p.location?.trim()),
    (p.skills?.length ?? 0) > 0,
    (p.languages?.length ?? 0) > 0,
    Boolean(p.cvUrl?.trim()),
    (p.projects?.length ?? 0) > 0,
    (p.experiences?.length ?? 0) > 0,
    Boolean(p.socials && Object.values(p.socials).some(Boolean))
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/** Recruiter is onboarded once a company record exists with a name. */
export function isRecruiterComplete(c?: Company | null): boolean {
  return Boolean(c && c.name?.trim());
}
