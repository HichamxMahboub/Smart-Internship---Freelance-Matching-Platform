import { apiClient } from '../api/apiClient';
import { AIResult, AIResultType } from '../types';
export const aiService = {
  async createJob(type: AIResultType, offerId?: string, applicationId?: string) { const { data } = await apiClient.post<AIResult>('/ai/jobs', { type, offerId, applicationId }); return data; },
  async getResult(id: string) { const { data } = await apiClient.get<AIResult>(`/ai/jobs/${id}/result`); return data; }
};
