import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app.config';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string): Observable<Translation> {
    // Query param busts the immutable /assets cache when locale strings change.
    return this.http.get<Translation>(
      `/assets/i18n/${lang}.json?v=${APP_CONFIG.i18nVersion}`,
    );
  }
}
