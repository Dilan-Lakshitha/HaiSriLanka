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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
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
import { RevealDirective } from '../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { TourCardComponent } from '../../../shared/cards/tour-card/tour-card.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { trackBySlug } from '../../../core/utils/track-by.util';
import type { Tour, TourListPageContent } from '../../../core/models/tour.model';
import { TourQuickViewComponent } from './tour-quick-view/tour-quick-view.component';

export type TourListCategory = 'day' | 'multi-day';

@Component({
  selector: 'app-tour-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
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
  private readonly destroyRef = inject(DestroyRef);
  readonly locale = inject(LocaleService);
  readonly trackBySlug = trackBySlug;

  readonly quickViewTour = signal<Tour | null>(null);

  readonly vm$ = toObservable(this.category).pipe(
    switchMap((category) => this.buildVm(category)),
    tap((vm) => this.applySeoAndCrumbs(vm)),
  );

  ngOnInit(): void {
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
    lang: string;
    detailPath: string;
    listPath: string;
    category: TourListCategory;
    listLabel: string;
  }> {
    const source$ = category === 'day' ? this.tours.getDayTours() : this.tours.getMultiDayTours();

    return combineLatest([source$, this.tours.getListContent(category)]).pipe(
      map(([tours, content]) => ({
        content,
        tours,
        lang: this.locale.activeLang(),
        detailPath: category === 'day' ? 'day-tour' : 'multi-day-tour',
        listPath: category === 'day' ? 'day-tours' : 'multi-day-tours',
        category,
        listLabel: category === 'day' ? 'Day Tours' : 'Multi-Day Tours',
      })),
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
}
