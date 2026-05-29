import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Offer, OfferPayload, OfferStatus, OfferType } from '../../core/models/offer.model';
import { AuthService } from '../../core/services/auth.service';
import { OfferService } from '../../core/services/offer.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({ selector: 'app-offers', standalone: true, imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule], templateUrl: './offers.component.html', styleUrl: './offers.component.scss' })
export class OffersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly offerService = inject(OfferService);
  private readonly snackBar = inject(MatSnackBar);
  readonly auth = inject(AuthService);
  readonly offers = signal<Offer[]>([]);
  selected?: Offer;
  status: OfferStatus | '' = '';
  type: OfferType | '' = '';
  location = '';
  displayedColumns = ['title', 'type', 'location', 'status', 'actions'];

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required], description: ['', Validators.required], type: ['INTERNSHIP' as OfferType, Validators.required],
    location: [''], duration: [''], requiredSkills: ['']
  });

  ngOnInit() { this.load(); }
  load() {
    const params = { status: this.status, type: this.type, location: this.location, page: 0, size: 50 };
    this.offerService.list(params).subscribe({
      next: (page) => this.offers.set(page.content ?? []),
      error: () => this.snackBar.open('Could not load offers.', 'Close', { duration: 3000 })
    });
  }
  edit(offer: Offer) { this.selected = offer; this.form.patchValue({ ...offer, requiredSkills: (offer.requiredSkills ?? []).join(', ') }); }
  reset() { this.selected = undefined; this.form.reset({ title: '', description: '', type: 'INTERNSHIP', location: '', duration: '', requiredSkills: '' }); }
  save() {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const payload: OfferPayload = { ...raw, requiredSkills: raw.requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean) };
    const request = this.selected ? this.offerService.update(this.selected.id, payload) : this.offerService.create(payload);
    request.subscribe({ next: () => { this.reset(); this.load(); }, error: () => this.snackBar.open('Could not save offer.', 'Close', { duration: 3000 }) });
  }
  publish(offer: Offer) { this.offerService.publish(offer.id).subscribe({ next: () => this.load(), error: () => this.snackBar.open('Could not publish offer.', 'Close', { duration: 3000 }) }); }
  archive(offer: Offer) { this.offerService.archive(offer.id).subscribe({ next: () => this.load(), error: () => this.snackBar.open('Could not archive offer.', 'Close', { duration: 3000 }) }); }
  remove(offer: Offer) { this.offerService.delete(offer.id).subscribe({ next: () => this.load(), error: () => this.snackBar.open('Could not delete offer.', 'Close', { duration: 3000 }) }); }
  moderate(offer: Offer, status: OfferStatus) { this.offerService.moderate(offer.id, status).subscribe({ next: () => this.load(), error: () => this.snackBar.open('Could not moderate offer.', 'Close', { duration: 3000 }) }); }
}
