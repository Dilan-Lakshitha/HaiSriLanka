import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, combineLatest } from 'rxjs';
import type { HomeContent, FaqItem, Tour, Destination, Review, BlogPost } from '../models';
import { TourService } from './tour.service';
import { DestinationService, BlogService, ReviewService, FaqService } from './content.services';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly tours = inject(TourService);
  private readonly destinations = inject(DestinationService);
  private readonly blogs = inject(BlogService);
  private readonly reviews = inject(ReviewService);
  private readonly faqs = inject(FaqService);

  private readonly home$ = this.http
    .get<HomeContent>('/assets/json/home.json')
    .pipe(shareReplay(1));

  getContent(): Observable<HomeContent> {
    return this.home$;
  }

  getFeaturedMultiDay(limit = 3): Observable<Tour[]> {
    return this.tours
      .getMultiDayTours()
      .pipe(
        map((items) =>
          items.filter((t) => t.featured || t.bestSeller || t.badges?.includes('featured') || t.badges?.includes('best-seller')).slice(0, limit),
        ),
      );
  }

  getFeaturedDayTours(limit = 3): Observable<Tour[]> {
    return this.tours
      .getDayTours()
      .pipe(
        map((items) =>
          items.filter((t) => t.featured || t.bestSeller || t.badges?.includes('featured') || t.badges?.includes('best-seller')).slice(0, limit),
        ),
      );
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
    return combineLatest([this.home$, this.faqs.getDataset()]).pipe(
      map(([home, dataset]) => {
        const pageFaqs =
          dataset.pages.find((p) => p.pageKey === home.faq.pageKey)?.items ?? [];
        return [...pageFaqs, ...dataset.global].slice(0, 5);
      }),
    );
  }
}
