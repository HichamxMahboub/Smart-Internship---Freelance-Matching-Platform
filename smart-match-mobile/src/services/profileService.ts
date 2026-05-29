import { apiClient } from '../api/apiClient';
import { CandidateProfile, RecruiterProfile } from '../types';
export const profileService = {
  async getCandidateProfile() { const { data } = await apiClient.get<CandidateProfile>('/candidate-profiles/me'); return data; },
  async updateCandidateProfile(payload: CandidateProfile) { const { data } = await apiClient.put<CandidateProfile>('/candidate-profiles/me', payload); return data; },
  async getRecruiterProfile() { const { data } = await apiClient.get<RecruiterProfile>('/recruiter-profiles/me'); return data; },
  async updateRecruiterProfile(payload: Partial<RecruiterProfile>) { const { data } = await apiClient.put<RecruiterProfile>('/recruiter-profiles/me', payload); return data; }
};
