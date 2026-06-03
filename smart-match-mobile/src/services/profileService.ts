import { apiClient } from '../api/apiClient';
import { appendDeviceFile } from './uploadService';
import { AIResult, CandidateProfile, RecruiterProfile, User } from '../types';

type PickedFile = { uri: string; name: string; mimeType: string };

export interface CandidateDetail {
  user: User;
  profile?: CandidateProfile;
  aiResults: AIResult[];
}

export const profileService = {
  async getCandidateProfile() { const { data } = await apiClient.get<CandidateProfile>('/candidate-profiles/me'); return data; },
  async updateCandidateProfile(payload: CandidateProfile) { const { data } = await apiClient.put<CandidateProfile>('/candidate-profiles/me', payload); return data; },
  async getCandidateDetail(candidateId: string) {
    const { data } = await apiClient.get<CandidateDetail>(`/candidate-profiles/${candidateId}/detail`);
    return data;
  },
  async getRecruiterProfile() { const { data } = await apiClient.get<RecruiterProfile>('/recruiter-profiles/me'); return data; },
  async updateRecruiterProfile(payload: Partial<RecruiterProfile>) { const { data } = await apiClient.put<RecruiterProfile>('/recruiter-profiles/me', payload); return data; },
  async uploadCandidateCvFromUri(file: PickedFile) {
    const form = new FormData();
    await appendDeviceFile(form, file);
    const { data } = await apiClient.post<{ cvUrl: string }>('/candidate-profiles/me/upload-cv', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.cvUrl;
  },
  async autofillFromCv(file: PickedFile, overwrite = false) {
    const form = new FormData();
    await appendDeviceFile(form, file);
    form.append('overwrite', overwrite ? 'true' : 'false');
    const { data } = await apiClient.post<{
      profile: CandidateProfile;
      aiUsed: boolean;
      source: string;
      extractedSkills: number;
      extractedExperiences: number;
      extractedEducations: number;
    }>('/candidate-profiles/me/autofill-from-cv', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  }
};
