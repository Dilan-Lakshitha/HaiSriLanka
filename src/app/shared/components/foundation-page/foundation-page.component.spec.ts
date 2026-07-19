import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { FoundationPageComponent } from './foundation-page.component';

describe('FoundationPageComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [
        FoundationPageComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              nav: { home: 'Home' },
              common: { comingSoon: 'Soon', backHome: 'Home' },
              placeholder: { foundationReady: 'Ready' },
              seo: { home: { title: 'Home', description: 'Desc' } },
            },
          },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(FoundationPageComponent);
    fixture.componentRef.setInput('pageTitleKey', 'nav.home');
    fixture.componentRef.setInput('seoKey', 'home');
    fixture.componentRef.setInput('path', '');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
