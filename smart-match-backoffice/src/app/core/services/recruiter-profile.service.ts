import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { RecruiterProfile } from '../models/recruiter-profile.model';

@Injectable({ providedIn: 'root' })
export class RecruiterProfileService {
  private readonly api = inject(ApiService);
  getMe() { return this.api.get<RecruiterProfile>('/recruiter-profiles/me'); }
  update(payload: Partial<RecruiterProfile>) { return this.api.put<RecruiterProfile>('/recruiter-profiles/me', payload); }
}
