import { apiClient } from '../api/apiClient';
import { Application, ApplicationStatus } from '../types';
export const applicationService = {
  async apply(payload: { offerId: string; message?: string }) { const { data } = await apiClient.post<Application>('/applications', payload); return data; },
  async myApplications() { const { data } = await apiClient.get<Application[]>('/applications/me'); return data; },
  async recruiterApplications() { const { data } = await apiClient.get<Application[]>('/applications/recruiter'); return data; },
  async updateStatus(id: string, status: ApplicationStatus) { const { data } = await apiClient.patch<Application>(`/applications/${id}/status`, { status }); return data; }
};
