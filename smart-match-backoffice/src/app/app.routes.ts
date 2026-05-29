import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './layout/main-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { CompaniesComponent } from './pages/companies/companies.component';
import { OffersComponent } from './pages/offers/offers.component';
import { ApplicationsComponent } from './pages/applications/applications.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'RECRUITER'] } },
      { path: 'users', component: UsersComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
      { path: 'companies', component: CompaniesComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
      { path: 'offers', component: OffersComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'RECRUITER'] } },
      { path: 'applications', component: ApplicationsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'RECRUITER'] } },
      { path: 'subscriptions', component: SubscriptionsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
      { path: 'notifications', component: NotificationsComponent, canActivate: [roleGuard], data: { roles: ['ADMIN', 'RECRUITER'] } },
      { path: 'profile', component: ProfileComponent, canActivate: [roleGuard], data: { roles: ['RECRUITER'] } }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
