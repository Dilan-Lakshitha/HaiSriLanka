import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, combineLatest, map, of, shareReplay, switchMap } from 'rxjs';
import type { Destination, Experience, BlogPost, Review, FaqDataset, CompanyInfo, NavigationConfig } from '../models';
import { ContentLocalizeService } from './content-localize.service';
import { LocaleService } from './locale.service';
import companySeed from '../../../assets/json/company.json';
import navigationSeed from '../../../assets/json/navigation.json';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly http = inject(HttpClient);
  private readonly localize = inject(ContentLocalizeService);
  private readonly locale = inject(LocaleService);
  private readonly lang$ = toObservable(this.locale.activeLang);

  private readonly data$ = this.http
    .get<Destination[]>('/assets/json/destinations.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Destination[]> {
    return combineLatest([this.data$, this.lang$]).pipe(
      switchMap(([items, lang]) =>
        this.localize
          .localizeListBySlug(
            items.filter((d) => d.status === 'published'),
            'destinations.json',
            lang,
          ),
      ),
    );
  }

  getBySlug(slug: string): Observable<Destination | undefined> {
    return this.getAll().pipe(map((items) => items.find((d) => d.slug === slug)));
  }
}

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  private readonly http = inject(HttpClient);
  private readonly localize = inject(ContentLocalizeService);
  private readonly locale = inject(LocaleService);
  private readonly lang$ = toObservable(this.locale.activeLang);

  private readonly data$ = this.http
    .get<Experience[]>('/assets/json/experiences.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Experience[]> {
    return combineLatest([this.data$, this.lang$]).pipe(
      switchMap(([items, lang]) =>
        this.localize.localizeListBySlug(
          items.filter((e) => e.status === 'published'),
          'experiences.json',
          lang,
        ),
      ),
    );
  }

  getBySlug(slug: string): Observable<Experience | undefined> {
    return this.getAll().pipe(map((items) => items.find((e) => e.slug === slug)));
  }
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly localize = inject(ContentLocalizeService);
  private readonly locale = inject(LocaleService);
  private readonly lang$ = toObservable(this.locale.activeLang);

  private readonly data$ = this.http
    .get<BlogPost[]>('/assets/json/blogs.json')
    .pipe(shareReplay(1));

  getAll(): Observable<BlogPost[]> {
    return combineLatest([this.data$, this.lang$]).pipe(
      switchMap(([items, lang]) => {
        const published = items
          .filter((b) => b.status === 'published')
          .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
        return this.localize.localizeListBySlug(published, 'blogs.json', lang);
      }),
    );
  }

  getBySlug(slug: string): Observable<BlogPost | undefined> {
    return this.getAll().pipe(map((items) => items.find((b) => b.slug === slug)));
  }
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly data$ = this.http
    .get<Review[]>('/assets/json/reviews.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Review[]> {
    return this.data$;
  }

  getByTourSlug(tourSlug: string): Observable<Review[]> {
    return this.data$.pipe(map((items) => items.filter((r) => r.tourSlug === tourSlug)));
  }
}

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly http = inject(HttpClient);
  private readonly localize = inject(ContentLocalizeService);
  private readonly locale = inject(LocaleService);
  private readonly lang$ = toObservable(this.locale.activeLang);

  private readonly data$ = this.http
    .get<FaqDataset>('/assets/json/faq.json')
    .pipe(shareReplay(1));

  getDataset(): Observable<FaqDataset> {
    return combineLatest([this.data$, this.lang$]).pipe(
      switchMap(([faq, lang]) => this.localize.localizeEntity(faq, 'faq.json', lang)),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly localize = inject(ContentLocalizeService);
  private readonly locale = inject(LocaleService);
  private readonly lang$ = toObservable(this.locale.activeLang);

  /** Sync seed avoids header/footer CLS while HTTP would still be in flight. */
  private readonly data$ = of(companySeed as CompanyInfo).pipe(shareReplay(1));

  getCompany(): Observable<CompanyInfo> {
    return combineLatest([this.data$, this.lang$]).pipe(
      switchMap(([company, lang]) =>
        this.localize.localizeEntity(company, 'company.json', lang),
      ),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly data$ = of(navigationSeed as NavigationConfig).pipe(shareReplay(1));

  getNavigation(): Observable<NavigationConfig> {
    return this.data$;
  }
}
