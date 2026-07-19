import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShellComponent } from './shell.component';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from '../../i18n/transloco-loader';

describe('ShellComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTransloco({
          config: { availableLangs: ['en'], defaultLang: 'en' },
          loader: TranslocoHttpLoader,
        }),
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
