import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserOverview } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { MaterialModule } from '../../shared/material/material.module';
import { UserDetailPanelComponent } from './user-detail-panel/user-detail-panel.component';
import { UserRoleRosterComponent, UserRosterRole } from './user-role-roster/user-role-roster.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    UserRoleRosterComponent,
    UserDetailPanelComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  readonly overview = signal<UserOverview[]>([]);
  readonly activeRole = signal<UserRosterRole>('CANDIDATE');
  readonly selected = signal<User | undefined>(undefined);

  search = '';

  readonly candidates = computed(() => this.overview().filter((u) => u.role === 'CANDIDATE'));
  readonly recruiters = computed(() => this.overview().filter((u) => u.role === 'RECRUITER'));

  readonly filteredCandidates = computed(() => this.filterBySearch(this.candidates()));
  readonly filteredRecruiters = computed(() => this.filterBySearch(this.recruiters()));

  readonly candidateStats = computed(() => this.buildCandidateStats(this.candidates()));
  readonly recruiterStats = computed(() => this.buildStats(this.recruiters()));

  ngOnInit() {
    this.load();
  }

  load() {
    this.userService.getOverview().subscribe({
      next: (items) => {
        this.overview.set(items);
        const current = this.selected();
        if (current) {
          const refreshed = items.find((u) => u.id === current.id);
          if (refreshed) {
            this.selected.set(this.toUser(refreshed));
            if (refreshed.role !== this.activeRole()) {
              this.activeRole.set(refreshed.role === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE');
            }
          }
        }
      },
      error: () => this.snackBar.open('Could not load users.', 'Close', { duration: 3000 })
    });
  }

  switchRole(role: UserRosterRole) {
    this.activeRole.set(role);
    const selected = this.selected();
    if (selected && selected.role !== role) {
      this.selected.set(undefined);
    }
  }

  selectUser(item: UserOverview) {
    this.selected.set(this.toUser(item));
    if (item.role === 'CANDIDATE' || item.role === 'RECRUITER') {
      this.activeRole.set(item.role);
    }
  }

  clearSelection() {
    this.selected.set(undefined);
  }

  onVerificationSynced(updated: User) {
    this.selected.set(updated);
    this.overview.update((list) => list.map((u) => (u.id === updated.id ? { ...u, emailVerified: updated.emailVerified, fullName: updated.fullName } : u)));
  }

  setStatus(item: UserOverview | User) {
    this.userService.setStatus(item.id, !item.active).subscribe({
      next: (updated) => {
        this.selected.set(updated);
        this.load();
        this.snackBar.open(updated.active ? 'Account activated.' : 'Account deactivated.', 'Close', { duration: 2500 });
      },
      error: () => this.snackBar.open('Could not update user status.', 'Close', { duration: 3000 })
    });
  }

  private toUser(item: UserOverview): User {
    return {
      id: item.id,
      fullName: item.fullName,
      email: item.email,
      role: item.role,
      plan: item.plan,
      active: item.active,
      emailVerified: item.emailVerified,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }

  private filterBySearch(list: UserOverview[]): UserOverview[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((u) => `${u.fullName} ${u.email} ${u.headline ?? ''} ${u.companyName ?? ''}`.toLowerCase().includes(term));
  }

  private buildStats(list: UserOverview[]) {
    const active = list.filter((u) => u.active).length;
    const premium = list.filter((u) => u.plan === 'PREMIUM').length;
    return { total: list.length, active, premium, free: list.length - premium };
  }

  private buildCandidateStats(list: UserOverview[]) {
    const base = this.buildStats(list);
    const withCv = list.filter((u) => Boolean(u.cvUrl)).length;
    const scored = list.filter((u) => typeof u.cvScore === 'number');
    const avgScore = scored.length
      ? Math.round(scored.reduce((acc, u) => acc + (u.cvScore ?? 0), 0) / scored.length)
      : null;
    return { ...base, withCv, avgScore };
  }
}
