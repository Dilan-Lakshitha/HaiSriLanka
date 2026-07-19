import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

export interface ContactRequest {
  name: string;
  email: string;
  whatsapp: string;
  message: string;
  locale: string;
}

export interface ContactResponse {
  status: 'sent' | 'pending';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private readonly http = inject(HttpClient);

  submit(request: ContactRequest): Observable<ContactResponse> {
    const url = `${APP_CONFIG.apiBaseUrl}${APP_CONFIG.contactApiPath}`;
    return this.http.post<ContactResponse>(url, request);
  }
}
