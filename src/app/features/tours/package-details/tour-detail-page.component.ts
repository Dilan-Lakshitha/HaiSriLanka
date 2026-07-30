import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, of, switchMap, tap } from 'rxjs';
import { TourService } from '../../../core/services/tour.service';
import { ReviewService, CompanyService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { SeoService } from '../../../core/seo/seo.service';
import { APP_CONFIG } from '../../../core/config/app.config';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildGraph,
  buildOrganizationSchema,
  buildTourOfferSchema,
  buildTourProductSchema,
} from '../../../core/seo/schema/schema.builders';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { LightboxComponent } from '../../../shared/lightbox/lightbox.component';
import { TourHeroComponent } from './sections/tour-hero/tour-hero.component';
import { TourOverviewComponent } from './sections/tour-overview/tour-overview.component';
import { TourHighlightsComponent } from './sections/tour-highlights/tour-highlights.component';
import { TourItineraryComponent } from './sections/tour-itinerary/tour-itinerary.component';
import { TourIncludesComponent } from './sections/tour-includes/tour-includes.component';
import { TourGalleryPreviewComponent } from './sections/tour-gallery-preview/tour-gallery-preview.component';
import { TourFaqComponent } from './sections/tour-faq/tour-faq.component';
import { TourRelatedComponent } from './sections/tour-related/tour-related.component';
import { TourBookingComponent } from './sections/tour-booking/tour-booking.component';
import { TourMobileBookBarComponent } from './sections/tour-mobile-book-bar/tour-mobile-book-bar.component';
import type { ImageAsset, Tour } from '../../../core/models';
import {
  tourExcluded,
  tourFaqs,
  tourGallery,
  tourIncluded,
  tourRelatedSlugs,
} from '../../../core/models/tour.model';

@Component({
  selector: 'app-tour-detail-page',
  standalone: true,
  imports: [
    AsyncPipe,
    UiContainerComponent,
    LightboxComponent,
    TourHeroComponent,
    TourOverviewComponent,
    TourHighlightsComponent,
    TourGalleryPreviewComponent,
    TourItineraryComponent,
    TourIncludesComponent,
    TourFaqComponent,
    TourRelatedComponent,
    TourBookingComponent,
    TourMobileBookBarComponent,
  ],
  templateUrl: './tour-detail-page.component.html',
  styleUrl: './tour-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tours = inject(TourService);
  private readonly reviews = inject(ReviewService);
  private readonly company = inject(CompanyService);
  private readonly seo = inject(SeoService);
  readonly locale = inject(LocaleService);

  readonly galleryOpen = signal(false);
  readonly galleryStart = signal(0);

  readonly vm$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const slug = params.get('slug') ?? '';
      return this.tours.getByLocalizedSlug(this.locale.activeLang(), slug).pipe(
        switchMap((tour) => {
          if (!tour) {
            return of(null);
          }
          return combineLatest({
            tour: of(tour),
            reviews: this.reviews.getByTourSlug(tour.slug).pipe(
              map((external) => {
                const embedded = tour.reviews ?? [];
                const merged = [...embedded];
                for (const review of external) {
                  if (!merged.some((r) => r.id === review.id)) {
                    merged.push(review);
                  }
                }
                return merged;
              }),
            ),
            related: this.tours.getBySlugs(tourRelatedSlugs(tour)),
            company: this.company.getCompany(),
          });
        }),
      );
    }),
    map((data) => {
      if (!data) {
        return null;
      }
      const detailPath = data.tour.category === 'day' ? 'day-tour' : 'multi-day-tour';
      const listPath = data.tour.category === 'day' ? 'day-tours' : 'multi-day-tours';
      const gallery: ImageAsset[] = tourGallery(data.tour);
      return {
        ...data,
        lang: this.locale.activeLang(),
        detailPath,
        listPath,
        gallery,
        galleryCount: gallery.length,
        included: tourIncluded(data.tour),
        excluded: tourExcluded(data.tour),
        faqs: tourFaqs(data.tour),
      };
    }),
    tap((vm) => {
      if (vm) {
        this.applySeo(vm);
      } else {
        const segments = this.router.url.split('/').filter(Boolean);
        const path = segments.slice(1).join('/') || 'tour-not-found';
        this.seo.update({
          title: 'Tour not found | Hai Sri Lanka Tours',
          description: 'This tour could not be found.',
          path,
          noIndex: true,
          jsonLd: null,
        });
      }
    }),
  );

  openGallery(index = 0): void {
    this.galleryStart.set(index);
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.galleryOpen.set(false);
  }

  private applySeo(vm: {
    tour: Tour;
    lang: string;
    detailPath: string;
    listPath: string;
    reviews: import('../../../core/models').Review[];
    company: import('../../../core/models').CompanyInfo;
    faqs: import('../../../core/models').FaqItem[];
  }): void {
    const { tour, lang, detailPath, listPath, reviews, company, faqs } = vm;
    const path = `${detailPath}/${tour.slug}`;
    const listLabel = tour.category === 'day' ? 'Day Tours' : 'Multi-Day Tours';

    this.seo.update({
      title: tour.seoTitle || tour.seo.metaTitle,
      description: tour.metaDescription || tour.seo.metaDescription,
      keywords: tour.seo.keywords,
      path,
      image: tour.heroImage?.src || tour.images[0]?.src,
      type: 'product',
      noIndex: tour.seo.noIndex,
      jsonLd: buildGraph(
        buildOrganizationSchema(company),
        buildTourProductSchema(tour, lang, reviews),
        buildTourOfferSchema(tour, lang),
        buildBreadcrumbSchema([
          { name: 'Home', url: `${APP_CONFIG.siteUrl}/${lang}` },
          { name: listLabel, url: `${APP_CONFIG.siteUrl}/${lang}/${listPath}` },
          { name: tour.title, url: `${APP_CONFIG.siteUrl}/${lang}/${path}` },
        ]),
        faqs.length ? buildFaqSchema(faqs) : null,
      ),
    });
  }
}
