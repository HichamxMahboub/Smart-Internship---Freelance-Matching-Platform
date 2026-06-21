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
    <main class="login">
      <aside class="brand-pane">
        <div class="brand-top">
          <img src="/interlance.png" alt="Interlance" class="brand-logo" />
          <span class="brand-name">Interlance</span>
        </div>

        <div class="brand-copy">
          <p class="brand-kicker">Backoffice</p>
          <h1>The control room for your internship &amp; freelance marketplace.</h1>
          <p class="brand-lead">
            Validate companies, moderate offers, follow applications and track premium growth —
            all from one place.
          </p>
        </div>

        <ul class="brand-points">
          <li><mat-icon>verified</mat-icon><span>Company validation &amp; moderation</span></li>
          <li><mat-icon>insights</mat-icon><span>Live marketplace analytics</span></li>
          <li><mat-icon>workspace_premium</mat-icon><span>Subscriptions &amp; revenue at a glance</span></li>
        </ul>

        <p class="brand-foot">© {{ year }} Interlance</p>
      </aside>

      <section class="form-pane">
        <div class="form-wrap">
          <header class="form-head">
            <h2>Sign in</h2>
            <p>Use your admin or recruiter account to continue.</p>
          </header>

          <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
            <mat-form-field appearance="outline" class="field">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" placeholder="you@company.com" />
              <mat-icon matPrefix>mail_outline</mat-icon>
              @if (form.controls.email.hasError('email') && form.controls.email.touched) {
                <mat-error>Enter a valid email address.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="field">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" autocomplete="current-password" placeholder="Your password" />
              <mat-icon matPrefix>lock_outline</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" [attr.aria-label]="hidePassword ? 'Show password' : 'Hide password'">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.password.hasError('required') && form.controls.password.touched) {
                <mat-error>Password is required.</mat-error>
              }
            </mat-form-field>

            <div class="row">
              <mat-checkbox color="primary">Keep me signed in</mat-checkbox>
            </div>

            <button mat-flat-button color="primary" type="submit" class="submit" [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Signing in…</span>
              } @else {
                <span>Sign in</span>
              }
            </button>
          </form>

          <p class="note">Restricted to ADMIN and RECRUITER accounts.</p>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; }

    .login {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      background: var(--surface);
    }

    /* ---- Left brand panel ---- */
    .brand-pane {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 40px;
      padding: 56px 56px 40px;
      color: #fff;
      background: var(--ink);
      overflow: hidden;
    }
    /* one calm brand accent, not floating orbs */
    .brand-pane::after {
      content: '';
      position: absolute;
      right: -160px;
      top: -120px;
      width: 460px;
      height: 460px;
      border-radius: 50%;
      background: radial-gradient(circle at center, rgba(31, 59, 224, 0.55), transparent 70%);
      pointer-events: none;
    }

    .brand-top { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
    .brand-logo { width: 38px; height: 38px; object-fit: contain; border-radius: 9px; background: #fff; padding: 5px; }
    .brand-name { font-size: 19px; font-weight: 800; letter-spacing: -0.01em; }

    .brand-copy { position: relative; z-index: 1; max-width: 460px; }
    .brand-kicker {
      margin: 0 0 14px; font-size: 12px; font-weight: 800; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--brand-teal);
    }
    .brand-copy h1 { margin: 0; font-size: 34px; line-height: 1.18; font-weight: 800; letter-spacing: -0.02em; }
    .brand-lead { margin: 18px 0 0; font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.72); font-weight: 500; }

    .brand-points { position: relative; z-index: 1; list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
    .brand-points li { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: rgba(255, 255, 255, 0.9); }
    .brand-points mat-icon {
      width: 36px; height: 36px; font-size: 20px; display: grid; place-items: center;
      border-radius: 10px; background: rgba(255, 255, 255, 0.08); color: var(--brand-teal); flex: none;
    }

    .brand-foot { position: relative; z-index: 1; margin: 0; font-size: 12.5px; color: rgba(255, 255, 255, 0.45); }

    /* ---- Right form panel ---- */
    .form-pane { display: grid; place-items: center; padding: 48px 32px; }
    .form-wrap { width: 100%; max-width: 380px; }

    .form-head h2 { margin: 0; font-size: 27px; font-weight: 800; letter-spacing: -0.02em; color: var(--ink); }
    .form-head p { margin: 8px 0 28px; color: var(--text-muted); font-size: 14.5px; font-weight: 500; }

    form { display: grid; gap: 6px; }
    .field { width: 100%; }
    .field mat-icon[matPrefix] { color: var(--text-faint); margin-right: 8px; }

    .row { display: flex; align-items: center; justify-content: space-between; margin: 2px 0 18px; }

    .submit {
      height: 48px; font-size: 15px; font-weight: 700;
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    }
    .submit mat-spinner { display: inline-block; }

    .note { margin: 22px 0 0; text-align: center; color: var(--text-faint); font-size: 12.5px; font-weight: 600; }

    @media (max-width: 880px) {
      .login { grid-template-columns: 1fr; }
      .brand-pane { display: none; }
      .form-pane { padding: 40px 24px; }
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
  readonly year = new Date().getFullYear();

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
