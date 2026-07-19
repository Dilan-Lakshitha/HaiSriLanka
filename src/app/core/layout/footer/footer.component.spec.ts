import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '../../i18n/transloco-loader';

describe('FooterComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTransloco({
          config: { availableLangs: ['en'], defaultLang: 'en' },
          loader: TranslocoHttpLoader,
        }),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FooterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
