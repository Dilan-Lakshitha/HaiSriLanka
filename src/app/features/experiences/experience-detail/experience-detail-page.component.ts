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
import type { Destination, Experience, ImageAsset } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import {
  DestinationService,
  ExperienceService,
} from '../../../core/services/content.services';
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
  selector: 'app-experience-detail-page',
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
  templateUrl: './experience-detail-page.component.html',
  styleUrl: './experience-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceDetailPageComponent {
  private readonly experiences = inject(ExperienceService);
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
      return this.experiences.getBySlug(slug).pipe(
        switchMap((experience) => {
          if (!experience) {
            return of({
              experience: null as Experience | null,
              related: [],
              places: [] as Destination[],
              gallery: [] as ImageAsset[],
              lang: this.locale.activeLang(),
              slug,
            });
          }
          return this.tours.getBySlugs(experience.relatedTourSlugs || []).pipe(
            switchMap((related) =>
              this.destinations.getAll().pipe(
                map((allDest) => {
                  const placeSlugs = experience.relatedDestinationSlugs || [];
                  const places = placeSlugs
                    .map((s) => allDest.find((d) => d.slug === s))
                    .filter((d): d is Destination => Boolean(d));
                  return {
                    experience,
                    related,
                    places,
                    gallery: experience.images || [],
                    lang: this.locale.activeLang(),
                    slug,
                  };
                }),
              ),
            ),
          );
        }),
      );
    }),
    tap((vm) => {
      if (vm.experience) {
        this.applySeo(vm.experience, vm.lang);
        this.breadcrumbs.set([
          { label: 'Home', url: `/${vm.lang}` },
          { label: 'Experiences', url: `/${vm.lang}/things-to-do` },
          { label: vm.experience.title },
        ]);
      } else {
        this.breadcrumbs.set([
          { label: 'Home', url: `/${vm.lang}` },
          { label: 'Experiences', url: `/${vm.lang}/things-to-do` },
          { label: 'Not found' },
        ]);
        this.seo.update({
          title: 'Experience not found | Hai Sri Lanka Tours',
          description: 'This experience page could not be found.',
          path: `things-to-do/${vm.slug}`,
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

  private applySeo(experience: Experience, lang: string): void {
    const path = `things-to-do/${experience.slug}`;
    this.seo.update({
      title: experience.seo.metaTitle,
      description: experience.seo.metaDescription,
      keywords: experience.seo.keywords,
      path,
      image: experience.images[0]?.src,
      type: 'article',
      jsonLd: buildGraph(
        buildBreadcrumbSchema([
          { name: 'Home', url: `/${lang}` },
          { name: 'Experiences', url: `/${lang}/things-to-do` },
          { name: experience.title, url: `/${lang}/${path}` },
        ]),
        {
          '@type': 'TouristAttraction',
          name: experience.title,
          description: experience.shortDescription,
          url: absUrl(`/${lang}/${path}`),
          image: experience.images.map((img) => absUrl(img.src)),
        },
      ),
    });
  }
}
