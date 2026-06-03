import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { Offer, OfferStatus } from '../../../core/models/offer.model';
import { MaterialModule } from '../../../shared/material/material.module';

export interface OfferStatusMeta {
  label: string;
  message: string;
  icon: string;
  tone: 'draft' | 'published' | 'archived' | 'blocked';
}

@Component({
  selector: 'app-offer-detail-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './offer-detail-panel.component.html',
  styleUrl: './offer-detail-panel.component.scss'
})
export class OfferDetailPanelComponent {
  readonly offer = input.required<Offer>();
  readonly isAdmin = input(false);
  readonly isRecruiter = input(false);
  readonly canManage = input(false);
  readonly editMode = input(false);

  readonly closed = output<void>();
  readonly edit = output<Offer>();
  readonly publish = output<Offer>();
  readonly archive = output<Offer>();
  readonly remove = output<Offer>();
  readonly block = output<Offer>();
  readonly restorePublished = output<Offer>();

  readonly statusMeta = computed(() => this.describeStatus(this.offer().status));

  readonly canPublish = computed(() => {
    const status = this.offer().status;
    return status === 'DRAFT' || status === 'ARCHIVED' || status === 'BLOCKED';
  });

  readonly canArchive = computed(() => this.offer().status === 'PUBLISHED');

  readonly canBlock = computed(() => this.offer().status !== 'BLOCKED');

  readonly canRestore = computed(() => this.offer().status === 'BLOCKED' && this.isAdmin());

  describeStatus(status: OfferStatus): OfferStatusMeta {
    switch (status) {
      case 'PUBLISHED':
        return {
          label: 'Published',
          message: 'Live on the marketplace — candidates can view and apply.',
          icon: 'public',
          tone: 'published'
        };
      case 'ARCHIVED':
        return {
          label: 'Archived',
          message: 'Hidden from candidates. Publish again to make it live.',
          icon: 'inventory_2',
          tone: 'archived'
        };
      case 'BLOCKED':
        return {
          label: 'Blocked',
          message: 'Moderated by admin and not visible to candidates.',
          icon: 'block',
          tone: 'blocked'
        };
      default:
        return {
          label: 'Draft',
          message: 'Not visible yet. Publish when ready to go live.',
          icon: 'edit_note',
          tone: 'draft'
        };
    }
  }

  statusClass(status: string): string {
    return `chip-${status.toLowerCase()}`;
  }

  formatDate(value?: string): string {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  shortId(id: string): string {
    if (id.length <= 12) return id;
    return `${id.slice(0, 6)}…${id.slice(-4)}`;
  }
}
