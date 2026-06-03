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
      <div class="login-background">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
        <div class="bg-grid"></div>
      </div>
      
      <div class="login-container">
        <div class="login-panel">
          <div class="login-header">
            <div class="logo-wrapper">
              <img src="/interlance.png" alt="Interlance" class="logo-image">
            </div>
            <div class="header-text">
              <h1>Interlance</h1>
              <p>Backoffice Command Center</p>
            </div>
          </div>

          <mat-card class="login-card">
            <div class="card-glow"></div>
            <mat-card-header>
              <mat-card-title>Welcome back</mat-card-title>
              <mat-card-subtitle>Sign in to access the command center</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <form [formGroup]="form" (ngSubmit)="submit()">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Email Address</mat-label>
                  <input matInput type="email" formControlName="email" autocomplete="email" placeholder="admin@interlance.com">
                  <mat-icon matPrefix>email</mat-icon>
                  @if (form.controls.email.hasError('email') && form.controls.email.touched) {
                    <mat-error>Please enter a valid email</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password" placeholder="Enter your password">
                  <mat-icon matPrefix>lock</mat-icon>
                  <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="'Toggle password visibility'">
                    <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (form.controls.password.hasError('required') && form.controls.password.touched) {
                    <mat-error>Password is required</mat-error>
                  }
                </mat-form-field>

                <div class="form-options">
                  <mat-checkbox color="primary">Remember me</mat-checkbox>
                </div>

                <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="form.invalid || loading">
                  @if (loading) {
                    <span class="submit-btn-content">
                      <mat-spinner diameter="20" color="accent"></mat-spinner>
                      <span>Signing in...</span>
                    </span>
                  } @else {
                    <span class="submit-btn-content">
                      <mat-icon>login</mat-icon>
                      <span>Sign in</span>
                    </span>
                  }
                </button>
              </form>
            </mat-card-content>
            
            <mat-card-footer>
              <div class="footer-links">
                <a href="#" class="link">Need help?</a>
                <span class="divider">•</span>
                <a href="#" class="link">Contact support</a>
              </div>
            </mat-card-footer>
          </mat-card>

          <div class="login-footer">
            <p>© 2024 Interlance. All rights reserved.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .login-page {
      position: relative;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      overflow: hidden;
      background: #0f0c29;
    }

    .login-background {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .bg-orb {
      position: absolute;
      border-radius: 999px;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;
    }

    .orb-1 {
      width: 500px;
      height: 500px;
      background: #667eea;
      top: -250px;
      right: -100px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 400px;
      height: 400px;
      background: #f093fb;
      bottom: -200px;
      left: -150px;
      animation-delay: 5s;
    }

    .orb-3 {
      width: 350px;
      height: 350px;
      background: #4facfe;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 10s;
    }

    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      25% {
        transform: translate(30px, -30px) scale(1.1);
      }
      50% {
        transform: translate(-20px, 20px) scale(0.9);
      }
      75% {
        transform: translate(20px, 30px) scale(1.05);
      }
    }

    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        rgba(255, 255, 255, 0.03),
        rgba(255, 255, 255, 0.03);
      background-size: 50px 50px;
      opacity: 0.4;
    }

    .login-container {
      position: relative;
      z-index: 1;
      width: min(480px, 100%);
    }

    .login-panel {
      animation: fadeInUp 0.8s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
      text-align: center;
    }

    .logo-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      padding: 20px;
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      animation: logoFloat 3s ease-in-out infinite;
    }

    @keyframes logoFloat {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-10px) rotate(2deg);
      }
    }

    .logo-wrapper::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 28px;
      background: #667eea;
      opacity: 0.6;
      filter: blur(10px);
      z-index: -1;
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 0.6;
        transform: scale(0.95);
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
    }

    .logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    }

    .header-text h1 {
      margin: 0;
      font-size: 42px;
      font-weight: 950;
      letter-spacing: -0.04em;
      background: #fff;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 20px rgba(255, 255, 255, 0.3);
    }

    .header-text p {
      margin: 8px 0 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .login-card {
      position: relative;
      padding: 32px;
      border-radius: 24px !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(20px);
      box-shadow: 
        0 30px 90px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
      overflow: visible;
      animation: cardEntrance 0.8s ease-out 0.2s both;
    }

    @keyframes cardEntrance {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .card-glow {
      position: absolute;
      inset: -100px;
      background: rgba(102, 126, 234, 0.3);
      pointer-events: none;
      z-index: -1;
    }

    mat-card-header {
      padding: 0;
      margin-bottom: 28px;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: var(--ink);
      margin-bottom: 8px !important;
    }

    mat-card-subtitle {
      color: var(--text-muted) !important;
      font-size: 14px;
      font-weight: 600;
    }

    mat-card-content {
      padding: 0;
    }

    form {
      display: grid;
      gap: 20px;
    }

    .form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: var(--surface);
      transition: all var(--transition-fast);
    }

    .form-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background: transparent;
    }

    .form-field:hover ::ng-deep .mat-mdc-text-field-wrapper {
      background: var(--surface-alt);
    }

    .form-field ::ng-deep .mat-mdc-form-field-icon-prefix mat-icon {
      color: var(--text-muted);
      margin-right: 8px;
    }

    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: -8px;
    }

    .submit-btn {
      height: 52px !important;
      font-size: 16px !important;
      font-weight: 800 !important;
      border-radius: 14px !important;
      background: var(--brand-primary) !important;
      box-shadow: 
        0 12px 28px rgba(31, 59, 224, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      transition: all var(--transition-fast) !important;
      gap: 8px;

      .submit-btn-content {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      &:hover:not([disabled]) {
        transform: translateY(-2px);
        box-shadow: 
          0 18px 38px rgba(31, 59, 224, 0.45),
          inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      }

      &:active:not([disabled]) {
        transform: translateY(0);
      }

      &[disabled] {
        opacity: 0.6;
      }

      mat-spinner {
        display: inline-block;
        margin-right: 8px;
      }
    }

    mat-card-footer {
      padding: 20px 0 0;
      margin-top: 24px;
      border-top: 1px solid var(--divider);
    }

    .footer-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 13px;
    }

    .footer-links .link {
      color: var(--brand-primary);
      font-weight: 700;
      text-decoration: none;
      transition: all var(--transition-fast);
      
      &:hover {
        color: var(--brand-primary-dark);
        text-decoration: underline;
      }
    }

    .footer-links .divider {
      color: var(--text-faint);
    }

    .login-footer {
      margin-top: 24px;
      text-align: center;
      
      p {
        margin: 0;
        color: rgba(255, 255, 255, 0.5);
        font-size: 13px;
        font-weight: 600;
      }
    }

    @media (max-width: 600px) {
      .login-page {
        padding: 16px;
      }

      .logo-wrapper {
        width: 100px;
        height: 100px;
        padding: 16px;
      }

      .header-text h1 {
        font-size: 32px;
      }

      .login-card {
        padding: 24px;
      }

      mat-card-title {
        font-size: 24px;
      }

      .submit-btn {
        height: 48px !important;
      }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  
  loading = false;
  hidePassword = true;

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
