import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Application, ApplicationStatus } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = inject(ApiService);

  getRecruiterApplications() { return this.api.get<Application[]>('/applications/recruiter'); }
  getApplication(id: string) { return this.api.get<Application>(`/applications/${id}`); }
  updateStatus(id: string, status: ApplicationStatus) { return this.api.patch<Application>(`/applications/${id}/status`, { status }); }
}
