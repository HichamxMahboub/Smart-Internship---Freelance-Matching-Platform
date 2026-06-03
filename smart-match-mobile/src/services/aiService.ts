import { apiClient } from '../api/apiClient';
import { AIResult, AIResultType, Application, CandidateProfile } from '../types';

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
  async candidateRecommendations(offerId: string) { const { data } = await apiClient.get<CandidateRecommendation[]>(`/ai/candidates/recommendations/${offerId}`); return data; }
};
