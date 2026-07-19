import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';
import type { BookingRequest, BookingResponse } from '../models';

/**
 * Frontend booking API client.
 * Points at Vercel `/api/bookings` now; later swap `APP_CONFIG.apiBaseUrl` to a dedicated API.
 */
@Injectable({ providedIn: 'root' })
export class BookingApiService {
  private readonly http = inject(HttpClient);

  submit(request: BookingRequest): Observable<BookingResponse> {
    const url = `${APP_CONFIG.apiBaseUrl}${APP_CONFIG.bookingApiPath}`;
    return this.http.post<BookingResponse>(url, request);
  }
}
