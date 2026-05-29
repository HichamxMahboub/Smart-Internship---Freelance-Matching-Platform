import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Offer, OfferPayload, OfferStatus, OfferType } from '../models/offer.model';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly api = inject(ApiService);

  list(params: { keyword?: string; type?: OfferType | ''; status?: OfferStatus | ''; location?: string; page?: number; size?: number }) {
    return this.api.get<PageResponse<Offer>>('/offers', params);
  }
  listAdmin(params: Record<string, string | number | undefined>) { return this.api.get<Offer[]>('/admin/offers', params); }
  create(payload: OfferPayload) { return this.api.post<Offer>('/offers', payload); }
  update(id: string, payload: OfferPayload) { return this.api.put<Offer>(`/offers/${id}`, payload); }
  delete(id: string) { return this.api.delete<void>(`/offers/${id}`); }
  publish(id: string) { return this.api.patch<Offer>(`/offers/${id}/publish`); }
  archive(id: string) { return this.api.patch<Offer>(`/offers/${id}/archive`); }
  moderate(id: string, status: OfferStatus, description = '') { return this.api.patch<Offer>(`/admin/offers/${id}/moderate`, { status, description }); }
}
