import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [
        LanguageSwitcherComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { nav: { language: 'Language' } } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(LanguageSwitcherComponent);
    fixture.componentRef.setInput('currentLang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
