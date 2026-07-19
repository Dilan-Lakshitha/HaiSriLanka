import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { MobileNavComponent } from './mobile-nav.component';

describe('MobileNavComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [
        MobileNavComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { nav: { openMenu: 'Open', closeMenu: 'Close' } } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(MobileNavComponent);
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
