import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import type { Destination, Experience, BlogPost, Review, FaqDataset, CompanyInfo, NavigationConfig } from '../models';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly http = inject(HttpClient);
  private readonly data$ = this.http
    .get<Destination[]>('/assets/json/destinations.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Destination[]> {
    return this.data$.pipe(map((items) => items.filter((d) => d.status === 'published')));
  }

  getBySlug(slug: string): Observable<Destination | undefined> {
    return this.getAll().pipe(map((items) => items.find((d) => d.slug === slug)));
  }
}

@Injectable({ providedIn: 'root' })
export class ExperienceService {
  private readonly http = inject(HttpClient);
  private readonly data$ = this.http
    .get<Experience[]>('/assets/json/experiences.json')
    .pipe(shareReplay(1));

  getAll(): Observable<Experience[]> {
    return this.data$.pipe(map((items) => items.filter((e) => e.status === 'published')));
  }

  getBySlug(slug: string): Observable<Experience | undefined> {
    return this.getAll().pipe(map((items) => items.find((e) => e.slug === slug)));
  }
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http = inject(HttpClient);
  private readonly data$ = this.http
    .get<BlogPost[]>('/assets/json/blogs.json')
    .pipe(shareReplay(1));

  getAll(): Observable<BlogPost[]> {
    return this.data$.pipe(
      map((items) =>
        items
          .filter((b) => b.status === 'published')
          .sort((a, b) => b.publishDate.localeCompare(a.publishDate)),
      ),
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
  private readonly data$ = this.http
    .get<FaqDataset>('/assets/json/faq.json')
    .pipe(shareReplay(1));

  getDataset(): Observable<FaqDataset> {
    return this.data$;
  }

  getGlobal(): Observable<FaqDataset['global']> {
    return this.data$.pipe(map((d) => d.global));
  }
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly data$ = this.http
    .get<CompanyInfo>('/assets/json/company.json')
    .pipe(shareReplay(1));

  getCompany(): Observable<CompanyInfo> {
    return this.data$;
  }
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly http = inject(HttpClient);
  private readonly data$ = this.http
    .get<NavigationConfig>('/assets/json/navigation.json')
    .pipe(shareReplay(1));

  getNavigation(): Observable<NavigationConfig> {
    return this.data$;
  }
}
