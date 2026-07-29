import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {
  Observable,
  combineLatest,
  defer,
  from,
  map,
  of,
  startWith,
  switchMap,
  take,
  timer,
} from 'rxjs';
import { HomeService } from '../../core/services/home.service';
import { LocaleService } from '../../core/services/locale.service';
import { SeoService } from '../../core/seo/seo.service';
import { CompanyService } from '../../core/services/content.services';
import {
  buildFaqSchema,
  buildGraph,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../../core/seo/schema/schema.builders';
import { HeroSectionComponent } from './sections/hero-section/hero-section.component';
import { WhyChooseComponent } from './sections/why-choose/why-choose.component';
import { TourCategoriesComponent } from './sections/tour-categories/tour-categories.component';
import { FeaturedToursComponent } from './sections/featured-tours/featured-tours.component';
import { DestinationsPreviewComponent } from './sections/destinations-preview/destinations-preview.component';
import { MapSectionComponent } from './sections/map-section/map-section.component';
import { ReviewsPreviewComponent } from './sections/reviews-preview/reviews-preview.component';
import { TravelStatsComponent } from './sections/travel-stats/travel-stats.component';
import { BlogPreviewComponent } from './sections/blog-preview/blog-preview.component';
import { FaqPreviewComponent } from './sections/faq-preview/faq-preview.component';
import { HomeCtaComponent } from './sections/home-cta/home-cta.component';
import type { BlogPost, Destination, FaqItem, Review, Tour } from '../../core/models';

type CatalogsVm = {
  multiDay: Tour[];
  dayTours: Tour[];
  destinations: Destination[];
  reviews: Review[];
  posts: BlogPost[];
  faqs: FaqItem[];
  lang: string;
};

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    AsyncPipe,
    HeroSectionComponent,
    WhyChooseComponent,
    TourCategoriesComponent,
    FeaturedToursComponent,
    DestinationsPreviewComponent,
    MapSectionComponent,
    ReviewsPreviewComponent,
    TravelStatsComponent,
    BlogPreviewComponent,
    FaqPreviewComponent,
    HomeCtaComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
  private readonly home = inject(HomeService);
  private readonly seo = inject(SeoService);
  private readonly company = inject(CompanyService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly locale = inject(LocaleService);

  /**
   * Seeded home.json — paints hero + why-choose on first CD.
   * Do not wait for tour/blog HTTP (that caused ~4s LCP element delay).
   */
  readonly homeVm$ = this.home.getContent().pipe(
    map((content) => ({
      content,
      lang: this.locale.activeLang(),
    })),
  );

  /**
   * Catalog HTTP waits for idle so it is not on the LCP critical request chain
   * (was chaining HTML → JS → all tour item JSON ~5s).
   */
  readonly catalogsVm$: Observable<CatalogsVm> = defer(() =>
    this.afterFirstPaint().pipe(
      switchMap(() =>
        combineLatest({
          multiDay: this.home.getFeaturedMultiDay(3).pipe(startWith([])),
          dayTours: this.home.getFeaturedDayTours(3).pipe(startWith([])),
          destinations: this.home.getPopularDestinations(4).pipe(startWith([])),
          reviews: this.home.getLatestReviews(3).pipe(startWith([])),
          posts: this.home.getLatestPosts(3).pipe(startWith([])),
          faqs: this.home.getHomeFaqs().pipe(startWith([])),
        }),
      ),
    ),
  ).pipe(
    startWith({
      multiDay: [] as Tour[],
      dayTours: [] as Tour[],
      destinations: [] as Destination[],
      reviews: [] as Review[],
      posts: [] as BlogPost[],
      faqs: [] as FaqItem[],
      lang: this.locale.activeLang(),
    }),
    map((data) => ({
      ...data,
      lang: this.locale.activeLang(),
    })),
  );

  ngOnInit(): void {
    this.home
      .getContent()
      .pipe(
        take(1),
        switchMap((content) =>
          combineLatest([this.company.getCompany(), this.home.getHomeFaqs()]).pipe(
            take(1),
            map(([company, faqs]) => ({ content, company, faqs })),
          ),
        ),
      )
      .subscribe(({ content, company, faqs }) => {
        const lcp = content.hero.images?.[0]?.src || content.hero.image.src;
        this.seo.update({
          title: content.seo.metaTitle,
          description: content.seo.metaDescription,
          keywords: content.seo.keywords,
          path: '',
          image: lcp,
          type: 'website',
          jsonLd: buildGraph(
            buildOrganizationSchema(company),
            buildLocalBusinessSchema(company),
            buildWebSiteSchema(),
            faqs.length ? buildFaqSchema(faqs) : null,
          ),
        });
      });
  }

  private afterFirstPaint(): Observable<null> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return from(
      new Promise<null>((resolve) => {
        const done = () => resolve(null);
        const w = window as Window & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        };
        if (typeof w.requestIdleCallback === 'function') {
          w.requestIdleCallback(done, { timeout: 2500 });
        } else {
          timer(1200).subscribe(() => done());
        }
      }),
    );
  }
}
