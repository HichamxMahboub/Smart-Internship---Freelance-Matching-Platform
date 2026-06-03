import { apiClient } from '../api/apiClient';
import { Company } from '../types';
export type CompanyPayload = Pick<Company, 'name' | 'sector' | 'size' | 'location' | 'description' | 'logoUrl' | 'website'>;
export const companyService = {
  async getMine() { const { data } = await apiClient.get<Company>('/companies/me'); return data; },
  async create(payload: CompanyPayload) { const { data } = await apiClient.post<Company>('/companies', payload); return data; },
  async update(id: string, payload: CompanyPayload) { const { data } = await apiClient.put<Company>(`/companies/${id}`, payload); return data; }
};
