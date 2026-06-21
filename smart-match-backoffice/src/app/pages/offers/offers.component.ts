import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Offer, OfferPayload, OfferStatus, OfferType } from '../../core/models/offer.model';
import { AuthService } from '../../core/services/auth.service';
import { OfferService } from '../../core/services/offer.service';
import { MaterialModule } from '../../shared/material/material.module';
import { OfferDetailPanelComponent } from './offer-detail-panel/offer-detail-panel.component';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    OfferDetailPanelComponent
  ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly offerService = inject(OfferService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);

  readonly offers = signal<Offer[]>([]);
  readonly detailSelected = signal<Offer | undefined>(undefined);
  readonly editingOfferId = signal<string | undefined>(undefined);
  readonly search = signal('');

  readonly canManageOffers = computed(() => {
    const role = this.auth.currentUser?.role;
    return role === 'ADMIN' || role === 'RECRUITER';
  });

  readonly totals = computed(() => {
    const list = this.offers();
    return {
      all: list.length,
      draft: list.filter((o) => o.status === 'DRAFT').length,
      published: list.filter((o) => o.status === 'PUBLISHED').length,
      archived: list.filter((o) => o.status === 'ARCHIVED').length,
      blocked: list.filter((o) => o.status === 'BLOCKED').length
    };
  });

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.offers();
    return this.offers().filter((o) =>
      o.title.toLowerCase().includes(term) ||
      (o.companyName ?? '').toLowerCase().includes(term) ||
      (o.location ?? '').toLowerCase().includes(term) ||
      (o.companySector ?? '').toLowerCase().includes(term)
    );
  });

  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  status: OfferStatus | '' = '';
  type: OfferType | '' = '';
  location = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    type: ['INTERNSHIP' as OfferType, Validators.required],
    location: [''],
    duration: [''],
    requiredSkills: ['']
  });

  ngOnInit() {
    this.load();
  }

  load() {
    const params = { status: this.status, type: this.type, location: this.location, page: 0, size: 50 };
    this.offerService.list(params).subscribe({
      next: (page) => {
        const list = page.content ?? [];
        this.offers.set(list);
        this.syncDetailSelection(list);
      },
      error: () => this.snackBar.open('Could not load offers.', 'Close', { duration: 3000 })
    });
  }

  private syncDetailSelection(list: Offer[]) {
    const current = this.detailSelected();
    if (!current) return;
    const refreshed = list.find((offer) => offer.id === current.id);
    if (refreshed) {
      this.detailSelected.set(refreshed);
      return;
    }
    this.detailSelected.set(current);
  }

  private applyOfferUpdate(updated: Offer) {
    this.detailSelected.set(updated);
    this.offers.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
  }

  private apiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;
      if (typeof body === 'string' && body.trim()) return body;
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
        return body.message;
      }
    }
    return fallback;
  }

  selectOffer(offer: Offer) {
    if (this.editingOfferId() && this.editingOfferId() !== offer.id) {
      this.cancelEdit();
    }
    this.detailSelected.set(offer);
  }

  clearDetail() {
    this.cancelEdit();
    this.detailSelected.set(undefined);
  }

  isDetailSelected(offer: Offer): boolean {
    return this.detailSelected()?.id === offer.id;
  }

  isEditing(offer: Offer): boolean {
    return this.editingOfferId() === offer.id;
  }

  statusListClass(status: OfferStatus): string {
    return `offer-list-status--${status.toLowerCase()}`;
  }

  edit(offer: Offer) {
    this.detailSelected.set(offer);
    this.editingOfferId.set(offer.id);
    this.form.patchValue({
      ...offer,
      requiredSkills: (offer.requiredSkills ?? []).join(', ')
    });
    this.snackBar.open('Edit the offer below, then save.', 'Close', { duration: 3500 });
  }

  cancelEdit() {
    this.editingOfferId.set(undefined);
    this.resetForm();
  }

  resetForm() {
    this.form.reset({
      title: '',
      description: '',
      type: 'INTERNSHIP',
      location: '',
      duration: '',
      requiredSkills: ''
    });
  }

  save() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload: OfferPayload = {
      ...raw,
      requiredSkills: raw.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean)
    };
    const editingId = this.editingOfferId();
    const request = editingId
      ? this.offerService.update(editingId, payload)
      : this.offerService.create(payload);
    request.subscribe({
      next: (saved) => {
        if (editingId) {
          this.applyOfferUpdate(saved);
          this.cancelEdit();
        } else {
          this.resetForm();
          this.detailSelected.set(saved);
        }
        this.load();
        this.snackBar.open(editingId ? 'Offer saved.' : 'Draft offer created.', 'Close', { duration: 2500 });
      },
      error: (err) =>
        this.snackBar.open(this.apiErrorMessage(err, 'Could not save offer.'), 'Close', { duration: 4000 })
    });
  }

  publish(offer: Offer) {
    if (offer.status === 'PUBLISHED') {
      this.snackBar.open('This offer is already published.', 'Close', { duration: 3000 });
      return;
    }
    this.offerService.publish(offer.id).subscribe({
      next: (updated) => {
        this.applyOfferUpdate(updated);
        this.load();
        this.snackBar.open('Offer is now live on the marketplace.', 'Close', { duration: 3000 });
      },
      error: (err) =>
        this.snackBar.open(this.apiErrorMessage(err, 'Could not publish offer.'), 'Close', { duration: 4000 })
    });
  }

  archive(offer: Offer) {
    if (offer.status === 'ARCHIVED') {
      this.snackBar.open('This offer is already archived.', 'Close', { duration: 3000 });
      return;
    }
    if (offer.status !== 'PUBLISHED') {
      this.snackBar.open('Only published offers can be archived.', 'Close', { duration: 3000 });
      return;
    }
    this.offerService.archive(offer.id).subscribe({
      next: (updated) => {
        this.applyOfferUpdate(updated);
        this.load();
        this.snackBar.open('Offer archived and hidden from candidates.', 'Close', { duration: 3000 });
      },
      error: (err) =>
        this.snackBar.open(this.apiErrorMessage(err, 'Could not archive offer.'), 'Close', { duration: 4000 })
    });
  }

  moderate(offer: Offer, status: OfferStatus) {
    this.offerService.moderate(offer.id, status).subscribe({
      next: (updated) => {
        this.applyOfferUpdate(updated);
        this.load();
        const label = status === 'PUBLISHED' ? 'restored and published' : 'updated';
        this.snackBar.open(`Offer ${label}.`, 'Close', { duration: 3000 });
      },
      error: (err) =>
        this.snackBar.open(this.apiErrorMessage(err, 'Could not update offer.'), 'Close', { duration: 4000 })
    });
  }

  remove(offer: Offer) {
    const request =
      this.auth.currentUser?.role === 'ADMIN'
        ? this.offerService.deleteAsAdmin(offer.id)
        : this.offerService.delete(offer.id);
    request.subscribe({
      next: () => {
        if (this.detailSelected()?.id === offer.id) {
          this.clearDetail();
        }
        this.load();
        this.snackBar.open('Offer removed.', 'Close', { duration: 2500 });
      },
      error: (err) =>
        this.snackBar.open(this.apiErrorMessage(err, 'Could not delete offer.'), 'Close', { duration: 4000 })
    });
  }
}
