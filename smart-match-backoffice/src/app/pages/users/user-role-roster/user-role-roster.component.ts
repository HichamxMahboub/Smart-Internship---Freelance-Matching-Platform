import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { User, UserOverview } from '../../../core/models/user.model';
import { MaterialModule } from '../../../shared/material/material.module';
import { UserDetailPanelComponent } from '../user-detail-panel/user-detail-panel.component';

export type UserRosterRole = 'CANDIDATE' | 'RECRUITER';

@Component({
  selector: 'app-user-role-roster',
  standalone: true,
  imports: [CommonModule, MaterialModule, UserDetailPanelComponent],
  templateUrl: './user-role-roster.component.html',
  styleUrl: './user-role-roster.component.scss'
})
export class UserRoleRosterComponent {
  readonly role = input.required<UserRosterRole>();
  readonly users = input.required<UserOverview[]>();
  readonly selectedId = input<string | undefined>();
  readonly selectedUser = input<User | undefined>();

  readonly userSelected = output<UserOverview>();
  readonly statusToggle = output<UserOverview>();
  readonly verificationSynced = output<User>();
  readonly panelClosed = output<void>();

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  isSelected(user: UserOverview): boolean {
    return this.selectedId() === user.id;
  }

  select(user: UserOverview) {
    if (this.isSelected(user)) {
      this.panelClosed.emit();
      return;
    }
    this.userSelected.emit(user);
  }

  toggleStatus(event: Event, user: UserOverview) {
    event.stopPropagation();
    this.statusToggle.emit(user);
  }

  scoreTone(score?: number): string {
    if (score == null) return 'score--empty';
    if (score >= 75) return 'score--high';
    if (score >= 50) return 'score--mid';
    return 'score--low';
  }
}
