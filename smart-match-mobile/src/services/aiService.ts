import { apiClient } from '../api/apiClient';
import { AIResult, AIResultType, Application, CandidateProfile, MatchItem } from '../types';

export interface CandidateRecommendation {
  application: Application;
  profile?: CandidateProfile;
  candidateName?: string;
  matchingScore?: number;
  reasons?: string[];
  gaps?: string[];
}

export const aiService = {
  async createJob(type: AIResultType, offerId?: string, applicationId?: string) { const { data } = await apiClient.post<AIResult>('/ai/jobs', { type, offerId, applicationId }); return data; },
  async getResult(id: string) { const { data } = await apiClient.get<AIResult>(`/ai/jobs/${id}/result`); return data; },
  async candidateRecommendations(offerId: string) { const { data } = await apiClient.get<CandidateRecommendation[]>(`/ai/candidates/recommendations/${offerId}`); return data; },
  /** AI-ranked offers best matching the signed-in candidate's profile (n8n + Gemini). Slow: allow 60s. */
  async candidateMatches() { const { data } = await apiClient.get<MatchItem[]>('/assistant/candidate-matches', { timeout: 60000 }); return data; },
  /** AI-ranked candidates best matching one of the recruiter's offers (n8n + Gemini). Slow: allow 60s. */
  async recruiterMatches(offerId: string) { const { data } = await apiClient.get<MatchItem[]>('/assistant/recruiter-matches', { params: { offerId }, timeout: 60000 }); return data; }
};
