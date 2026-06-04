import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { User, Role, UserDetail, UserOverview } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getMe() { return this.api.get<User>('/users/me'); }
  updateMe(fullName: string) { return this.api.put<User>('/users/me', { fullName }); }
  getUsers() { return this.api.get<User[]>('/admin/users'); }
  getOverview() { return this.api.get<UserOverview[]>('/admin/users/overview'); }
  getUserDetail(id: string) { return this.api.get<UserDetail>(`/admin/users/${id}`); }
  setStatus(id: string, active: boolean) { return this.api.patch<User>(`/admin/users/${id}/status`, { active }); }
  syncVerification(id: string) { return this.api.post<User>(`/admin/users/${id}/sync-verification`, {}); }
  runCvAnalysis(id: string) { return this.api.post<UserDetail>(`/admin/users/${id}/run-cv-analysis`, {}); }
}
