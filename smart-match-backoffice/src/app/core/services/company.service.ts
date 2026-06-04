import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Company, CompanyOverview, ValidationStatus } from '../models/company.model';

export type CompanyPayload = Omit<Company, 'id' | 'recruiterId' | 'validationStatus' | 'createdAt' | 'updatedAt'>;

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly api = inject(ApiService);

  getAdminCompanies() { return this.api.get<Company[]>('/admin/companies'); }
  getAdminCompaniesOverview() { return this.api.get<CompanyOverview[]>('/admin/companies/overview'); }
  validateCompany(id: string, validationStatus: ValidationStatus, description = '') {
    return this.api.patch<Company>(`/admin/companies/${id}/validate`, { validationStatus, description });
  }
  getMyCompany() { return this.api.get<Company>('/companies/me'); }
  createCompany(payload: CompanyPayload) { return this.api.post<Company>('/companies', payload); }
  updateCompany(id: string, payload: CompanyPayload) { return this.api.put<Company>(`/companies/${id}`, payload); }
}
