import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { AdminDashboard } from '../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);
  getDashboard() { return this.api.get<AdminDashboard>('/admin/dashboard'); }
}
