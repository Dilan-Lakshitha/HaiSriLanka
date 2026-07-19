import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [
        NotFoundComponent,
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              common: { notFoundTitle: '404', notFoundBody: 'Missing', backHome: 'Home' },
              seo: { notFound: { title: '404', description: 'Missing' } },
            },
          },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
        }),
      ],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(NotFoundComponent).componentInstance).toBeTruthy();
  });
});
