import { colors } from '../theme/colors';
import { Offer, OfferMatch } from '../types';

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Skill-overlap match between a candidate's skills and an offer's required
 * skills. Mirrors the backend heuristic (calculateMatchingScore) so the UI can
 * surface a match level immediately, without waiting on the AI scoring job.
 * When the backend returns an AI/match score, prefer that over this estimate.
 */
export function computeMatch(candidateSkills: string[] = [], requiredSkills: string[] = []): OfferMatch {
  const required = requiredSkills.filter(Boolean);
  if (!required.length) return { score: 100, matched: [], missing: [] };
  const have = new Set(candidateSkills.filter(Boolean).map(norm));
  const matched: string[] = [];
  const missing: string[] = [];
  required.forEach((skill) => {
    if (have.has(norm(skill))) matched.push(skill);
    else missing.push(skill);
  });
  const score = Math.round((matched.length / required.length) * 100);
  return { score, matched, missing };
}

export function matchForOffer(candidateSkills: string[] = [], offer: Offer): OfferMatch {
  return computeMatch(candidateSkills, offer.requiredSkills ?? []);
}

export type MatchTone = 'low' | 'med' | 'high';

export function matchTone(score: number): MatchTone {
  if (score >= 70) return 'high';
  if (score >= 40) return 'med';
  return 'low';
}

export function matchColors(score: number): { fg: string; soft: string; label: string } {
  const tone = matchTone(score);
  if (tone === 'high') return { fg: colors.matchHigh, soft: colors.matchHighSoft, label: 'Strong fit' };
  if (tone === 'med') return { fg: colors.matchMed, soft: colors.matchMedSoft, label: 'Partial fit' };
  return { fg: colors.matchLow, soft: colors.matchLowSoft, label: 'Low fit' };
}
