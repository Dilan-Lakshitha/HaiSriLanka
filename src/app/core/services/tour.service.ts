import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';
import type {
  Tour,
  TourListPageContent,
  TourListsContent,
  TourManifest,
} from '../models/tour.model';
import { tourHasBadge } from '../models/tour.model';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly http = inject(HttpClient);

  private readonly manifest$ = this.http
    .get<TourManifest>('/assets/json/tours/manifest.json')
    .pipe(shareReplay(1));

  private readonly lists$ = this.http
    .get<TourListsContent>('/assets/json/tours/lists.json')
    .pipe(shareReplay(1));

  private readonly allTours$ = this.manifest$.pipe(
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
    return this.lists$.pipe(map((lists) => lists[category]));
  }

  getDayTours(): Observable<Tour[]> {
    return this.allTours$.pipe(map((tours) => tours.filter((t) => t.category === 'day')));
  }

  getMultiDayTours(): Observable<Tour[]> {
    return this.allTours$.pipe(map((tours) => tours.filter((t) => t.category === 'multi-day')));
  }

  getAllTours(): Observable<Tour[]> {
    return this.allTours$;
  }

  getBySlug(slug: string): Observable<Tour | undefined> {
    return this.http.get<Tour>(`/assets/json/tours/items/${slug}.json`).pipe(
      map((tour) => (tour.status === 'published' ? tour : undefined)),
      catchError(() => of(undefined)),
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
    // Fetch only requested tours — avoid waiting on the full catalog.
    const unique = [...new Set(slugs)];
    return forkJoin(
      unique.map((slug) =>
        this.http
          .get<Tour>(`/assets/json/tours/items/${slug}.json`)
          .pipe(
            map((tour) => (tour.status === 'published' ? tour : null)),
            catchError(() => of(null)),
          ),
      ),
    ).pipe(
      map((items) => {
        const bySlug = new Map(
          items.filter((t): t is Tour => Boolean(t)).map((t) => [t.slug, t]),
        );
        return slugs
          .map((slug) => bySlug.get(slug))
          .filter((t): t is Tour => Boolean(t));
      }),
    );
  }
}
