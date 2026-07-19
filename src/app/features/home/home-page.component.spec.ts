import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { HomePageComponent } from './home-page.component';
import { TranslocoHttpLoader } from '../../core/i18n/transloco-loader';

describe('HomePageComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTransloco({
          config: { availableLangs: ['en'], defaultLang: 'en' },
          loader: TranslocoHttpLoader,
        }),
      ],
    }).compileComponents();
    expect(TestBed.createComponent(HomePageComponent).componentInstance).toBeTruthy();
  });
});
