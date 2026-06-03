import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { UserRosterRole } from '../user-role-roster/user-role-roster.component';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-user-detail-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './user-detail-panel.component.html',
  styleUrl: './user-detail-panel.component.scss'
})
export class UserDetailPanelComponent {
  readonly user = input.required<User>();
  readonly rosterRole = input.required<UserRosterRole>();

  readonly closed = output<void>();
  readonly statusToggle = output<User>();

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
