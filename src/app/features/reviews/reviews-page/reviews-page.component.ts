import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { map, tap } from 'rxjs';
import type { ImageAsset } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { CompanyService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { PageSeoFacade } from '../../../core/seo/page-seo.facade';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { ElfsightReviewsComponent } from '../../../shared/components/elfsight-reviews/elfsight-reviews.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';

const HERO_IMAGE: ImageAsset = {
  src: '/assets/images/hero/carousel-king-coconut.png',
  alt: 'Guests enjoying a Sri Lanka journey with Hai Sri Lanka',
  title: 'Guest experiences',
  width: 1920,
  height: 1080,
};

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    BreadcrumbComponent,
    ElfsightReviewsComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './reviews-page.component.html',
  styleUrl: './reviews-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsPageComponent implements OnInit {
  private readonly company = inject(CompanyService);
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  readonly locale = inject(LocaleService);

  readonly heroImage = HERO_IMAGE;

  readonly vm$ = this.company.getCompany().pipe(
    map((company) => ({
      company,
      lang: this.locale.activeLang(),
    })),
    tap((vm) => {
      void this.seo.applyTranslatedPage('reviews', 'reviews', {
        breadcrumbs: [
          { name: 'Home' },
          { name: 'nav.reviews', path: 'reviews' },
        ],
        extraNodes: [
          {
            '@type': 'WebPage',
            name: 'Guest Reviews | Hai Sri Lanka Tours',
            description:
              'Read verified guest reviews of Hai Sri Lanka Tours on TripAdvisor and Google.',
            about: {
              '@type': 'TravelAgency',
              name: vm.company.brandName,
              aggregateRating: vm.company.tripadvisor
                ? {
                    '@type': 'AggregateRating',
                    ratingValue: vm.company.tripadvisor.rating,
                    reviewCount: vm.company.tripadvisor.reviewCount,
                  }
                : undefined,
            },
          },
        ],
      });
    }),
  );

  ngOnInit(): void {
    const lang = this.locale.activeLang();
    this.breadcrumbs.set([
      { label: 'Home', url: `/${lang}` },
      { label: 'Reviews' },
    ]);
  }
}
