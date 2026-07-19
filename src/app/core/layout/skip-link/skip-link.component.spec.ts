import { TestBed } from '@angular/core/testing';
import { provideTransloco, TranslocoTestingModule } from '@jsverse/transloco';
import { SkipLinkComponent } from './skip-link.component';

describe('SkipLinkComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SkipLinkComponent,
        TranslocoTestingModule.forRoot({
          langs: { en: { nav: { skipToContent: 'Skip to main content' } } },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SkipLinkComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
