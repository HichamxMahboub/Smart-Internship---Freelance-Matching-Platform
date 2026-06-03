import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { MaterialModule } from '../../../shared/material/material.module';

export type UserRosterRole = 'CANDIDATE' | 'RECRUITER';

@Component({
  selector: 'app-user-role-roster',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './user-role-roster.component.html',
  styleUrl: './user-role-roster.component.scss'
})
export class UserRoleRosterComponent {
  readonly role = input.required<UserRosterRole>();
  readonly users = input.required<User[]>();
  readonly selectedId = input<string | undefined>();

  readonly userSelected = output<User>();
  readonly statusToggle = output<User>();

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  isSelected(user: User): boolean {
    return this.selectedId() === user.id;
  }

  select(user: User) {
    this.userSelected.emit(user);
  }

  toggleStatus(event: Event, user: User) {
    event.stopPropagation();
    this.statusToggle.emit(user);
  }
}
