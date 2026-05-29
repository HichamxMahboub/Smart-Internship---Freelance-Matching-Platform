import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { MaterialModule } from '../shared/material/material.module';

interface NavItem { label: string; icon: string; route: string; roles: string[]; }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MaterialModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Users', icon: 'group', route: '/users', roles: ['ADMIN'] },
    { label: 'Companies', icon: 'business', route: '/companies', roles: ['ADMIN'] },
    { label: 'Offers', icon: 'work', route: '/offers', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Applications', icon: 'assignment', route: '/applications', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Subscriptions', icon: 'workspace_premium', route: '/subscriptions', roles: ['ADMIN'] },
    { label: 'Notifications', icon: 'notifications', route: '/notifications', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Profile', icon: 'account_circle', route: '/profile', roles: ['RECRUITER'] }
  ];

  visible(item: NavItem) {
    const role = this.auth.currentUser?.role;
    return !!role && item.roles.includes(role);
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
