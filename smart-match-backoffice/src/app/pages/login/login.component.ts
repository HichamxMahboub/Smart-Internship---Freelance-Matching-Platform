import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  template: `
    <section class="login-page">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Smart Match Backoffice</mat-card-title>
          <mat-card-subtitle>Admin and recruiter dashboard</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password">
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || loading">
              @if (loading) { Signing in... } @else { Sign in }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f6f8fb; }
    .login-card { width: min(420px, 100%); border-radius: 8px; }
    form { display: grid; gap: 16px; margin-top: 24px; }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  loading = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.controls.email.value, this.form.controls.password.value).subscribe({
      next: (user) => {
        this.loading = false;
        if (!['ADMIN', 'RECRUITER'].includes(user.role)) {
          this.snackBar.open('Only ADMIN and RECRUITER accounts can access the backoffice.', 'Close', { duration: 4000 });
          this.auth.logout().subscribe();
          return;
        }
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Login failed. Check Firebase credentials and backend user role.', 'Close', { duration: 5000 });
      }
    });
  }
}
