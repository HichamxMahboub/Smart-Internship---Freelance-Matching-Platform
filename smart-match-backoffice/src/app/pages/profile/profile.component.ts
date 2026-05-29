import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Company } from '../../core/models/company.model';
import { CompanyService } from '../../core/services/company.service';
import { RecruiterProfileService } from '../../core/services/recruiter-profile.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-profile', standalone: true, imports: [CommonModule, ReactiveFormsModule, MaterialModule], templateUrl: './profile.component.html', styleUrl: './profile.component.scss' })
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(RecruiterProfileService);
  private readonly companyService = inject(CompanyService);
  private readonly snackBar = inject(MatSnackBar);
  company?: Company;

  readonly profileForm = this.fb.nonNullable.group({ position: [''], phone: [''] });
  readonly companyForm = this.fb.nonNullable.group({ name: [''], sector: [''], description: [''], logoUrl: [''], website: [''] });

  ngOnInit() { this.load(); }
  load() {
    this.profileService.getMe().subscribe({ next: (profile) => this.profileForm.patchValue({ position: profile.position ?? '', phone: profile.phone ?? '' }), error: () => undefined });
    this.companyService.getMyCompany().subscribe({ next: (company) => { this.company = company; this.companyForm.patchValue(company); }, error: () => this.company = undefined });
  }
  saveProfile() { this.profileService.update(this.profileForm.getRawValue()).subscribe({ next: () => this.snackBar.open('Profile saved.', 'Close', { duration: 2500 }), error: () => this.snackBar.open('Could not save profile.', 'Close', { duration: 3000 }) }); }
  saveCompany() {
    const payload = this.companyForm.getRawValue();
    const request = this.company ? this.companyService.updateCompany(this.company.id, payload) : this.companyService.createCompany(payload);
    request.subscribe({ next: (company) => { this.company = company; this.companyForm.patchValue(company); this.snackBar.open('Company saved.', 'Close', { duration: 2500 }); }, error: () => this.snackBar.open('Could not save company.', 'Close', { duration: 3000 }) });
  }
}
