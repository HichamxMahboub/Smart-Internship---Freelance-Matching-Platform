import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined | null>) {
    return this.http.get<T>(this.url(path), { params: this.toParams(params) });
  }

  post<T>(path: string, body?: unknown) {
    return this.http.post<T>(this.url(path), body ?? {});
  }

  put<T>(path: string, body?: unknown) {
    return this.http.put<T>(this.url(path), body ?? {});
  }

  patch<T>(path: string, body?: unknown) {
    return this.http.patch<T>(this.url(path), body ?? {});
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.url(path));
  }

  private url(path: string) {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private toParams(params?: Record<string, string | number | boolean | undefined | null>) {
    let httpParams = new HttpParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }
}
