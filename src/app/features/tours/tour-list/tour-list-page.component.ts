import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, combineLatest, map, switchMap, tap } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app.config';
import { TourService } from '../../../core/services/tour.service';
import { LocaleService } from '../../../core/services/locale.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { SeoService } from '../../../core/seo/seo.service';
import {
  buildBreadcrumbSchema,
  buildGraph,
  buildTourItemListSchema,
} from '../../../core/seo/schema/schema.builders';
import { CompareService } from '../../../core/services/compare.service';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { TourCardComponent } from '../../../shared/cards/tour-card/tour-card.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { trackBySlug } from '../../../core/utils/track-by.util';
import type { Tour, TourListPageContent } from '../../../core/models/tour.model';
import { tourPriceMap } from '../../../core/models/tour.model';
import { TourQuickViewComponent } from './tour-quick-view/tour-quick-view.component';

export type TourListCategory = 'day' | 'multi-day';
type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'title';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-tour-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    FormsModule,
    RouterLink,
    RevealDirective,
    UiContainerComponent,
    TourCardComponent,
    TourQuickViewComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './tour-list-page.component.html',
  styleUrl: './tour-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourListPageComponent implements OnInit {
  readonly category = input.required<TourListCategory>();

  private readonly tours = inject(TourService);
  private readonly seo = inject(SeoService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly locale = inject(LocaleService);
  readonly compare = inject(CompareService);
  readonly trackBySlug = trackBySlug;

  readonly search = signal('');
  readonly styleFilter = signal('all');
  readonly badgeFilter = signal('all');
  readonly destinationFilter = signal('all');
  readonly sort = signal<SortKey>('featured');
  readonly view = signal<ViewMode>('grid');
  readonly quickViewTour = signal<Tour | null>(null);

  readonly vm$ = toObservable(this.category).pipe(
    switchMap((category) => this.buildVm(category)),
    tap((vm) => this.applySeoAndCrumbs(vm)),
  );

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const q = params.get('q');
      if (q) this.search.set(q);

      const destination = params.get('destination');
      if (destination && destination !== 'all') this.destinationFilter.set(destination);

      const style = params.get('style');
      if (style && style !== 'all') this.styleFilter.set(style);
    });

    this.destroyRef.onDestroy(() => this.breadcrumbs.clear());
  }

  openQuickView(tour: Tour): void {
    this.quickViewTour.set(tour);
  }

  closeQuickView(): void {
    this.quickViewTour.set(null);
  }

  private buildVm(category: TourListCategory): Observable<{
    content: TourListPageContent;
    tours: Tour[];
    styles: string[];
    destinations: string[];
    badges: string[];
    lang: string;
    detailPath: string;
    listPath: string;
    category: TourListCategory;
    listLabel: string;
  }> {
    const source$ = category === 'day' ? this.tours.getDayTours() : this.tours.getMultiDayTours();

    return combineLatest([source$, this.tours.getListContent(category)]).pipe(
      map(([tours, content]) => {
        const styles = [...new Set(tours.map((t) => t.travelStyle).filter(Boolean))].sort();
        const destinations = [...new Set(tours.flatMap((t) => t.destinations || []))].sort();
        const badges = [...new Set(tours.flatMap((t) => t.badges || []))].sort();

        return {
          content,
          tours,
          styles,
          destinations,
          badges,
          lang: this.locale.activeLang(),
          detailPath: category === 'day' ? 'day-tour' : 'multi-day-tour',
          listPath: category === 'day' ? 'day-tours' : 'multi-day-tours',
          category,
          listLabel: category === 'day' ? 'Day Tours' : 'Multi-Day Tours',
        };
      }),
    );
  }

  private applySeoAndCrumbs(vm: {
    content: TourListPageContent;
    tours: Tour[];
    lang: string;
    listPath: string;
    listLabel: string;
  }): void {
    this.breadcrumbs.set([
      { label: 'Home', url: `/${vm.lang}` },
      { label: 'Tours', url: `/${vm.lang}/sri-lanka-tours` },
      { label: vm.listLabel },
    ]);

    this.seo.update({
      title: vm.content.seo.metaTitle,
      description: vm.content.seo.metaDescription,
      keywords: vm.content.seo.keywords,
      path: vm.listPath,
      image: vm.content.hero.image.src,
      type: 'website',
      jsonLd: buildGraph(
        buildBreadcrumbSchema([
          { name: 'Home', url: `${APP_CONFIG.siteUrl}/${vm.lang}` },
          { name: 'Tours', url: `${APP_CONFIG.siteUrl}/${vm.lang}/sri-lanka-tours` },
          {
            name: vm.listLabel,
            url: `${APP_CONFIG.siteUrl}/${vm.lang}/${vm.listPath}`,
          },
        ]),
        buildTourItemListSchema(vm.tours, vm.lang, vm.listLabel, vm.listPath),
      ),
    });
  }

  filteredTours(tours: Tour[]): Tour[] {
    const q = this.search().trim().toLowerCase();
    const style = this.styleFilter();
    const badge = this.badgeFilter();
    const destination = this.destinationFilter();
    let next = tours.filter((tour) => {
      if (style !== 'all' && tour.travelStyle !== style) return false;
      if (badge !== 'all' && !(tour.badges || []).includes(badge as never)) return false;
      if (destination !== 'all' && !(tour.destinations || []).includes(destination)) return false;
      if (!q) return true;
      const hay = [
        tour.title,
        tour.shortDescription,
        tour.overview,
        ...(tour.tags || []),
        ...(tour.destinations || []),
        tour.travelStyle,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    switch (this.sort()) {
      case 'price-asc':
        next = [...next].sort((a, b) => tourPriceMap(a)['2'] - tourPriceMap(b)['2']);
        break;
      case 'price-desc':
        next = [...next].sort((a, b) => tourPriceMap(b)['2'] - tourPriceMap(a)['2']);
        break;
      case 'rating':
        next = [...next].sort((a, b) => b.rating.average - a.rating.average);
        break;
      case 'title':
        next = [...next].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        next = [...next].sort((a, b) => {
          const score = (t: Tour) =>
            (t.badges?.includes('best-seller') ? 2 : 0) + (t.badges?.includes('featured') ? 1 : 0);
          return score(b) - score(a);
        });
    }
    return next;
  }
}
