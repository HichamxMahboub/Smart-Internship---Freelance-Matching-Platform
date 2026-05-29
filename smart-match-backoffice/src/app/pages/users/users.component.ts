import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, Role } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-users', standalone: true, imports: [CommonModule, FormsModule, MaterialModule], templateUrl: './users.component.html', styleUrl: './users.component.scss' })
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);
  readonly users = signal<User[]>([]);
  search = '';
  role: Role | '' = '';
  displayedColumns = ['fullName', 'email', 'role', 'plan', 'active', 'actions'];
  filteredUsers = computed(() => this.users().filter((user) => {
    const term = this.search.trim().toLowerCase();
    const matchesTerm = !term || `${user.fullName} ${user.email}`.toLowerCase().includes(term);
    const matchesRole = !this.role || user.role === this.role;
    return matchesTerm && matchesRole;
  }));

  ngOnInit() { this.load(); }
  load() { this.userService.getUsers().subscribe({ next: (users) => this.users.set(users), error: () => this.snackBar.open('Could not load users.', 'Close', { duration: 3000 }) }); }
  setStatus(user: User) { this.userService.setStatus(user.id, !user.active).subscribe({ next: () => this.load(), error: () => this.snackBar.open('Could not update user status.', 'Close', { duration: 3000 }) }); }
}
