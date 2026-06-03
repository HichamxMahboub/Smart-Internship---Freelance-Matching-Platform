import { Component } from '@angular/core';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-offer-detail-placeholder',
  standalone: true,
  imports: [MaterialModule],
  template: `
    <div class="placeholder" aria-hidden="true">
      <div class="placeholder__icon">
        <mat-icon>work</mat-icon>
      </div>
      <h2 class="placeholder__title">Select an offer</h2>
      <p class="placeholder__text">Click an offer in the list to see type, location, skills, status, and actions.</p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .placeholder {
      position: sticky;
      top: 16px;
      padding: 32px 24px;
      text-align: center;
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-xl);
      background: var(--surface);
    }
    .placeholder__icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      margin: 0 auto 14px;
      border-radius: 16px;
      background: var(--brand-primary-soft);
      color: var(--brand-primary);
    }
    .placeholder__icon mat-icon {
      width: 28px;
      height: 28px;
      font-size: 28px;
    }
    .placeholder__title {
      margin: 0 0 8px;
      font-size: 18px;
      font-weight: 800;
      color: var(--ink);
    }
    .placeholder__text {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
      color: var(--text-muted);
    }
  `]
})
export class OfferDetailPlaceholderComponent {}
