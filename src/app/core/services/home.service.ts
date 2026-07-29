import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay, combineLatest, switchMap } from 'rxjs';
import type { HomeContent, FaqItem, Tour, Destination, Review, BlogPost } from '../models';
import { TourService } from './tour.service';
import { DestinationService, BlogService, ReviewService, FaqService } from './content.services';
import { ContentLocalizeService } from './content-localize.service';
import { LocaleService } from './locale.service';
import homeSeed from '../../../assets/json/home.json';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly tours = inject(TourService);
  private readonly destinations = inject(DestinationService);
  private readonly blogs = inject(BlogService);
  private readonly reviews = inject(ReviewService);
  private readonly faqs = inject(FaqService);
  private readonly localize = inject(ContentLocalizeService);
  private readonly locale = inject(LocaleService);
  private readonly lang$ = this.locale.lang$;

  /** Sync seed so the hero paints on first CD (cuts CSR CLS ~1.0+). */
  private readonly home$ = of(homeSeed as HomeContent).pipe(shareReplay(1));

  getContent(): Observable<HomeContent> {
    return combineLatest([this.home$, this.lang$]).pipe(
      switchMap(([home, lang]) => this.localize.localizeEntity(home, 'home.json', lang)),
    );
  }

  getFeaturedMultiDay(limit = 3): Observable<Tour[]> {
    return this.tours.getFeaturedTours('multi-day', limit);
  }

  getFeaturedDayTours(limit = 3): Observable<Tour[]> {
    return this.tours.getFeaturedTours('day', limit);
  }

  getPopularDestinations(limit = 4): Observable<Destination[]> {
    return this.destinations.getAll().pipe(map((items) => items.slice(0, limit)));
  }

  getLatestReviews(limit = 3): Observable<Review[]> {
    return this.reviews.getAll().pipe(map((items) => items.slice(0, limit)));
  }

  getLatestPosts(limit = 3): Observable<BlogPost[]> {
    return this.blogs.getAll().pipe(map((items) => items.slice(0, limit)));
  }

  getHomeFaqs(): Observable<FaqItem[]> {
    return combineLatest([this.getContent(), this.faqs.getDataset()]).pipe(
      map(([home, dataset]) => {
        const pageFaqs =
          dataset.pages.find((p) => p.pageKey === home.faq.pageKey)?.items ?? [];
        return [...pageFaqs, ...dataset.global].slice(0, 5);
      }),
    );
  }
}
