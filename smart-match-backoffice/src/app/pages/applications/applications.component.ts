import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Application, ApplicationStatus } from '../../core/models/application.model';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-applications', standalone: true, imports: [CommonModule, MaterialModule], templateUrl: './applications.component.html', styleUrl: './applications.component.scss' })
export class ApplicationsComponent implements OnInit {
  private readonly applicationService = inject(ApplicationService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);
  readonly applications = signal<Application[]>([]);
  selected?: Application;
  displayedColumns = ['offerId', 'candidateId', 'status', 'matchingScore', 'actions'];

  ngOnInit() { this.load(); }
  load() {
    if (this.auth.currentUser?.role === 'RECRUITER') {
      this.applicationService.getRecruiterApplications().subscribe({ next: (apps) => this.applications.set(apps), error: () => this.snackBar.open('Could not load applications.', 'Close', { duration: 3000 }) });
    }
  }
  view(application: Application) { this.selected = application; }
  setStatus(application: Application, status: ApplicationStatus) { this.applicationService.updateStatus(application.id, status).subscribe({ next: () => this.load(), error: () => this.snackBar.open('Could not update status.', 'Close', { duration: 3000 }) }); }
}
