import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  Observable,
  catchError,
  combineLatest,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import type {
  Tour,
  TourListPageContent,
  TourListsContent,
  TourManifest,
} from '../models/tour.model';
import { tourHasBadge } from '../models/tour.model';
import { ContentLocalizeService } from './content-localize.service';
import { LocaleService } from './locale.service';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly http = inject(HttpClient);
  private readonly localize = inject(ContentLocalizeService);
  private readonly locale = inject(LocaleService);
  private readonly lang$ = toObservable(this.locale.activeLang);

  private readonly manifest$ = this.http
    .get<TourManifest>('/assets/json/tours/manifest.json')
    .pipe(shareReplay(1));

  private readonly lists$ = this.http
    .get<TourListsContent>('/assets/json/tours/lists.json')
    .pipe(shareReplay(1));

  private readonly baseTours$ = this.manifest$.pipe(
    switchMap((manifest) => {
      const published = manifest.tours.filter((t) => t.status === 'published');
      if (!published.length) {
        return of([] as Tour[]);
      }
      return forkJoin(
        published.map((entry) =>
          this.http
            .get<Tour>(`/assets/json/tours/items/${entry.slug}.json`)
            .pipe(catchError(() => of(null))),
        ),
      ).pipe(map((items) => items.filter((t): t is Tour => Boolean(t && t.status === 'published'))));
    }),
    shareReplay(1),
  );

  getManifest(): Observable<TourManifest> {
    return this.manifest$;
  }

  getListContent(category: 'hub' | 'day' | 'multi-day'): Observable<TourListPageContent> {
    return combineLatest([this.lists$, this.lang$]).pipe(
      switchMap(([lists, lang]) =>
        this.localize.localizeEntity(lists, 'tours/lists.json', lang).pipe(
          map((localized) => localized[category]),
        ),
      ),
    );
  }

  getDayTours(): Observable<Tour[]> {
    return this.getAllTours().pipe(map((tours) => tours.filter((t) => t.category === 'day')));
  }

  getMultiDayTours(): Observable<Tour[]> {
    return this.getAllTours().pipe(map((tours) => tours.filter((t) => t.category === 'multi-day')));
  }

  getAllTours(): Observable<Tour[]> {
    return combineLatest([this.baseTours$, this.lang$]).pipe(
      switchMap(([tours, lang]) => {
        if (!tours.length) {
          return of([]);
        }
        return forkJoin(
          tours.map((tour) =>
            this.localize.localizeEntity(tour, `tours/items/${tour.slug}.json`, lang),
          ),
        );
      }),
    );
  }

  getBySlug(slug: string): Observable<Tour | undefined> {
    return combineLatest([
      this.http.get<Tour>(`/assets/json/tours/items/${slug}.json`).pipe(
        map((tour) => (tour.status === 'published' ? tour : undefined)),
        catchError(() => of(undefined)),
      ),
      this.lang$,
    ]).pipe(
      switchMap(([tour, lang]) => {
        if (!tour) {
          return of(undefined);
        }
        return this.localize.localizeEntity(tour, `tours/items/${tour.slug}.json`, lang);
      }),
    );
  }

  getByLocalizedSlug(_locale: string, slug: string): Observable<Tour | undefined> {
    return this.getBySlug(slug).pipe(
      switchMap((direct) => {
        if (direct) {
          return of(direct);
        }
        return this.getAllTours().pipe(
          map((tours) =>
            tours.find(
              (t) =>
                t.slug === slug ||
                (t.localizedSlugs && Object.values(t.localizedSlugs).includes(slug)),
            ),
          ),
        );
      }),
    );
  }

  getFeatured(): Observable<Tour[]> {
    return this.getAllTours().pipe(
      map((tours) => tours.filter((t) => tourHasBadge(t, 'featured'))),
    );
  }

  getBySlugs(slugs: string[]): Observable<Tour[]> {
    if (!slugs.length) {
      return of([]);
    }
    const unique = [...new Set(slugs)];
    return combineLatest([
      forkJoin(
        unique.map((slug) =>
          this.http.get<Tour>(`/assets/json/tours/items/${slug}.json`).pipe(
            map((tour) => (tour.status === 'published' ? tour : null)),
            catchError(() => of(null)),
          ),
        ),
      ),
      this.lang$,
    ]).pipe(
      switchMap(([items, lang]) => {
        const published = items.filter((t): t is Tour => Boolean(t));
        if (!published.length) {
          return of([]);
        }
        return forkJoin(
          published.map((tour) =>
            this.localize.localizeEntity(tour, `tours/items/${tour.slug}.json`, lang),
          ),
        ).pipe(
          map((localized) => {
            const bySlug = new Map(localized.map((t) => [t.slug, t]));
            return slugs.map((slug) => bySlug.get(slug)).filter((t): t is Tour => Boolean(t));
          }),
        );
      }),
    );
  }
}
