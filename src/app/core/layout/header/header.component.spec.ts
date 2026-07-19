import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeaderComponent } from './header.component';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '../../i18n/transloco-loader';

describe('HeaderComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTransloco({
          config: { availableLangs: ['en'], defaultLang: 'en' },
          loader: TranslocoHttpLoader,
        }),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
