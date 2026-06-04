import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserDetail } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
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
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  readonly user = input.required<User>();
  readonly rosterRole = input.required<UserRosterRole>();

  readonly closed = output<void>();
  readonly statusToggle = output<User>();
  readonly verificationSynced = output<User>();

  readonly detail = signal<UserDetail | undefined>(undefined);
  readonly loading = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly syncing = signal(false);
  readonly analyzing = signal(false);
  readonly activeTab = signal<'ai' | 'profile'>('profile');

  readonly resumeAi = computed(() => {
    const ai = this.detail()?.aiResults ?? [];
    return ai.filter((r) => r.type === 'CV_ANALYSIS' || r.type === 'PROFILE_OPTIMIZATION');
  });

  readonly latestCvScore = computed(() => {
    const ai = this.detail()?.aiResults ?? [];
    const cv = ai.find((r) => r.type === 'CV_ANALYSIS');
    return cv?.score != null ? Math.round(cv.score) : null;
  });

  readonly datasetSummary = computed(() => {
    const p = this.detail()?.candidateProfile;
    const ai = this.detail()?.aiResults ?? [];
    return {
      skills: p?.skillLevels?.length ?? p?.skills?.length ?? 0,
      languages: p?.languages?.length ?? 0,
      experiences: p?.experiences?.length ?? 0,
      educations: p?.educations?.length ?? 0,
      projects: p?.projects?.length ?? 0,
      preferences: p?.preferences?.length ?? 0,
      hasCv: Boolean(p?.cvUrl),
      aiResults: ai.length
    };
  });

  constructor() {
    effect(() => {
      const current = this.user();
      if (!current) {
        this.detail.set(undefined);
        return;
      }
      this.activeTab.set(this.rosterRole() === 'CANDIDATE' ? 'ai' : 'profile');
      this.loadDetail(current.id);
    });
  }

  private loadDetail(id: string) {
    this.loading.set(true);
    this.error.set(undefined);
    this.userService.getUserDetail(id).subscribe({
      next: (data) => { this.detail.set(data); this.loading.set(false); },
      error: () => { this.error.set('Could not load detailed profile.'); this.loading.set(false); }
    });
  }

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

  openLink(url?: string) {
    if (url) window.open(url, '_blank', 'noopener');
  }

  setTab(tab: 'ai' | 'profile') {
    this.activeTab.set(tab);
  }

  scoreLabel(score?: number): string {
    if (score == null) return '—';
    return `${Math.round(score)}%`;
  }

  runCvAnalysis() {
    if (this.analyzing()) return;
    this.analyzing.set(true);
    this.userService.runCvAnalysis(this.user().id).subscribe({
      next: (updated) => {
        this.detail.set(updated);
        this.analyzing.set(false);
        this.snackBar.open('AI resume analysis ready.', 'Close', { duration: 2500 });
      },
      error: () => {
        this.analyzing.set(false);
        this.snackBar.open('Could not run AI analysis. Make sure the candidate has a CV uploaded.', 'Close', { duration: 3500 });
      }
    });
  }

  syncVerification() {
    if (this.syncing()) return;
    this.syncing.set(true);
    this.userService.syncVerification(this.user().id).subscribe({
      next: (updated) => {
        this.syncing.set(false);
        this.verificationSynced.emit(updated);
        this.snackBar.open(
          updated.emailVerified ? 'Email verification synced (verified).' : 'Firebase still reports email not verified.',
          'Close',
          { duration: 2500 }
        );
      },
      error: () => {
        this.syncing.set(false);
        this.snackBar.open('Could not sync verification from Firebase.', 'Close', { duration: 3000 });
      }
    });
  }
}
