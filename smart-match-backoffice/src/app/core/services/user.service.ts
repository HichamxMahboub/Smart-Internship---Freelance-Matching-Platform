import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { User, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getMe() { return this.api.get<User>('/users/me'); }
  updateMe(fullName: string) { return this.api.put<User>('/users/me', { fullName }); }
  getUsers() { return this.api.get<User[]>('/admin/users'); }
  setStatus(id: string, active: boolean) { return this.api.patch<User>(`/admin/users/${id}/status`, { active }); }
}
