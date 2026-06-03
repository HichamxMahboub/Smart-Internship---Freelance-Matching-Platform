import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { RealtimeService } from '../core/services/realtime.service';
import { MaterialModule } from '../shared/material/material.module';

interface NavItem { label: string; icon: string; route: string; roles: string[]; }

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MaterialModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly realtime = inject(RealtimeService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly breakpoint = inject(BreakpointObserver);
  private sub?: Subscription;
  private layoutSub?: Subscription;

  @ViewChild('drawer') drawer?: MatSidenav;

  isMobile = false;
  sidebarCollapsed = false;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Users', icon: 'group', route: '/users', roles: ['ADMIN'] },
    { label: 'Companies', icon: 'business', route: '/companies', roles: ['ADMIN'] },
    { label: 'Offers', icon: 'work', route: '/offers', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Applications', icon: 'assignment', route: '/applications', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Subscriptions', icon: 'workspace_premium', route: '/subscriptions', roles: ['ADMIN'] },
    { label: 'Notifications', icon: 'notifications', route: '/notifications', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Messages', icon: 'chat', route: '/messages', roles: ['ADMIN', 'RECRUITER'] },
    { label: 'Profile', icon: 'account_circle', route: '/profile', roles: ['RECRUITER'] }
  ];

  ngOnInit() {
    this.realtime.connect();
    this.sub = this.realtime.notifications$.subscribe((notification) => {
      this.snackBar.open(`${notification.title}: ${notification.message}`, 'Close', { duration: 5000 });
    });

    const stored = localStorage.getItem('sm-backoffice-sidebar-collapsed');
    this.sidebarCollapsed = stored === null ? true : stored === 'true';
  }

  ngAfterViewInit() {
    this.layoutSub = this.breakpoint.observe(['(max-width: 900px)']).subscribe((state) => {
      this.isMobile = state.matches;
      if (this.isMobile) {
        this.drawer?.close();
      } else {
        this.drawer?.open();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.layoutSub?.unsubscribe();
    this.realtime.disconnect();
  }

  sidenavMode(): 'over' | 'side' {
    return this.isMobile ? 'over' : 'side';
  }

  toggleNav() {
    if (this.isMobile) {
      this.drawer?.toggle();
      return;
    }
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('sm-backoffice-sidebar-collapsed', String(this.sidebarCollapsed));
  }

  navIcon(): string {
    return this.isMobile ? 'menu' : 'menu_open';
  }

  closeMobileNav() {
    if (this.isMobile) {
      this.drawer?.close();
    }
  }

  visible(item: NavItem) {
    const role = this.auth.currentUser?.role;
    return !!role && item.roles.includes(role);
  }

  userInitials(): string {
    const name = this.auth.currentUser?.fullName?.trim();
    if (!name) {
      return 'SM';
    }
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
