import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../core/models/user.model';
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

  readonly users = signal<User[]>([]);
  readonly activeRole = signal<UserRosterRole>('CANDIDATE');
  readonly selected = signal<User | undefined>(undefined);

  search = '';

  readonly candidates = computed(() => this.users().filter((user) => user.role === 'CANDIDATE'));
  readonly recruiters = computed(() => this.users().filter((user) => user.role === 'RECRUITER'));

  readonly filteredCandidates = computed(() => this.filterBySearch(this.candidates()));
  readonly filteredRecruiters = computed(() => this.filterBySearch(this.recruiters()));

  readonly candidateStats = computed(() => this.buildStats(this.candidates()));
  readonly recruiterStats = computed(() => this.buildStats(this.recruiters()));

  ngOnInit() {
    this.load();
  }

  load() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        const current = this.selected();
        if (current) {
          const refreshed = users.find((user) => user.id === current.id);
          this.selected.set(refreshed);
          if (refreshed && refreshed.role !== this.activeRole()) {
            this.activeRole.set(refreshed.role === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE');
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

  selectUser(user: User) {
    this.selected.set(user);
    if (user.role === 'CANDIDATE' || user.role === 'RECRUITER') {
      this.activeRole.set(user.role);
    }
  }

  clearSelection() {
    this.selected.set(undefined);
  }

  setStatus(user: User) {
    this.userService.setStatus(user.id, !user.active).subscribe({
      next: (updated) => {
        this.selected.set(updated);
        this.load();
        this.snackBar.open(updated.active ? 'Account activated.' : 'Account deactivated.', 'Close', { duration: 2500 });
      },
      error: () => this.snackBar.open('Could not update user status.', 'Close', { duration: 3000 })
    });
  }

  private filterBySearch(list: User[]): User[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((user) => `${user.fullName} ${user.email}`.toLowerCase().includes(term));
  }

  private buildStats(list: User[]) {
    const active = list.filter((user) => user.active).length;
    const premium = list.filter((user) => user.plan === 'PREMIUM').length;
    return { total: list.length, active, premium, free: list.length - premium };
  }
}
