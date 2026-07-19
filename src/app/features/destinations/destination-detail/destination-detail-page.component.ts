import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import type { Destination, ImageAsset } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { DestinationService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { TourService } from '../../../core/services/tour.service';
import {
  buildBreadcrumbSchema,
  buildGraph,
  absUrl,
} from '../../../core/seo/schema/schema.builders';
import { SeoService } from '../../../core/seo/seo.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { LightboxComponent } from '../../../shared/lightbox/lightbox.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { TourRelatedComponent } from '../../tours/package-details/sections/tour-related/tour-related.component';
import { TourGalleryPreviewComponent } from '../../tours/package-details/sections/tour-gallery-preview/tour-gallery-preview.component';

@Component({
  selector: 'app-destination-detail-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    BreadcrumbComponent,
    LightboxComponent,
    UiButtonComponent,
    UiContainerComponent,
    TourGalleryPreviewComponent,
    TourRelatedComponent,
  ],
  templateUrl: './destination-detail-page.component.html',
  styleUrl: './destination-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestinationDetailPageComponent {
  private readonly destinations = inject(DestinationService);
  private readonly tours = inject(TourService);
  private readonly seo = inject(SeoService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly route = inject(ActivatedRoute);
  readonly locale = inject(LocaleService);

  readonly galleryOpen = signal(false);
  readonly galleryStart = signal(0);

  readonly vm$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const slug = params.get('slug') || '';
      return this.destinations.getBySlug(slug).pipe(
        switchMap((destination) => {
          if (!destination) {
            return of({
              destination: null as Destination | null,
              related: [],
              gallery: [] as ImageAsset[],
              lang: this.locale.activeLang(),
              slug,
            });
          }
          return this.tours.getBySlugs(destination.relatedTourSlugs || []).pipe(
            map((related) => ({
              destination,
              related,
              gallery: destination.images || [],
              lang: this.locale.activeLang(),
              slug,
            })),
          );
        }),
      );
    }),
    tap((vm) => {
      if (vm.destination) {
        this.applySeo(vm.destination, vm.lang);
        this.breadcrumbs.set([
          { label: 'Home', url: `/${vm.lang}` },
          { label: 'Destinations', url: `/${vm.lang}/destinations` },
          { label: vm.destination.title },
        ]);
      } else {
        this.breadcrumbs.set([
          { label: 'Home', url: `/${vm.lang}` },
          { label: 'Destinations', url: `/${vm.lang}/destinations` },
          { label: 'Not found' },
        ]);
        this.seo.update({
          title: 'Destination not found | Hai Sri Lanka Tours',
          description: 'This destination page could not be found.',
          path: `destinations/${vm.slug}`,
          noIndex: true,
          jsonLd: null,
        });
      }
    }),
  );

  openGallery(index: number): void {
    this.galleryStart.set(index);
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.galleryOpen.set(false);
  }

  private applySeo(destination: Destination, lang: string): void {
    const path = `destinations/${destination.slug}`;
    this.seo.update({
      title: destination.seo.metaTitle,
      description: destination.seo.metaDescription,
      keywords: destination.seo.keywords,
      path,
      image: destination.images[0]?.src,
      type: 'article',
      jsonLd: buildGraph(
        buildBreadcrumbSchema([
          { name: 'Home', url: `/${lang}` },
          { name: 'Destinations', url: `/${lang}/destinations` },
          { name: destination.title, url: `/${lang}/${path}` },
        ]),
        {
          '@type': 'TouristAttraction',
          name: destination.title,
          description: destination.shortDescription,
          url: absUrl(`/${lang}/${path}`),
          image: destination.images.map((img) => absUrl(img.src)),
          address: {
            '@type': 'PostalAddress',
            addressRegion: destination.region,
            addressCountry: 'LK',
          },
        },
      ),
    });
  }
}
