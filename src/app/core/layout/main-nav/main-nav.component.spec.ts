import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { MainNavComponent } from './main-nav.component';

describe('MainNavComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainNavComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { nav: { home: 'Home' } } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(MainNavComponent);
    fixture.componentRef.setInput('items', [{ key: 'nav.home', path: '' }]);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
