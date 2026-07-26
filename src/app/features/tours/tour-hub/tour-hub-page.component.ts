import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, map, tap } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app.config';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import type { Tour, TourListPageContent } from '../../../core/models/tour.model';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { LocaleService } from '../../../core/services/locale.service';
import { TourService } from '../../../core/services/tour.service';
import {
  buildBreadcrumbSchema,
  buildGraph,
  buildTourItemListSchema,
} from '../../../core/seo/schema/schema.builders';
import { SeoService } from '../../../core/seo/seo.service';
import { trackBySlug } from '../../../core/utils/track-by.util';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { TourCardComponent } from '../../../shared/cards/tour-card/tour-card.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { TourQuickViewComponent } from '../tour-list/tour-quick-view/tour-quick-view.component';
import { TranslocoPipe } from '@jsverse/transloco';

export type TourHubTab = 'day' | 'multi-day';

@Component({
  selector: 'app-tour-hub-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    BreadcrumbComponent,
    TourCardComponent,
    TourQuickViewComponent,
    UiButtonComponent,
    UiContainerComponent,
    TranslocoPipe,
  ],
  templateUrl: './tour-hub-page.component.html',
  styleUrl: './tour-hub-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourHubPageComponent implements OnInit {
  private readonly tours = inject(TourService);
  private readonly seo = inject(SeoService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly locale = inject(LocaleService);
  readonly trackBySlug = trackBySlug;

  readonly activeTab = signal<TourHubTab>('day');
  readonly quickViewTour = signal<Tour | null>(null);

  readonly vm$ = combineLatest([
    this.tours.getListContent('hub'),
    this.tours.getDayTours(),
    this.tours.getMultiDayTours(),
    toObservable(this.activeTab),
  ]).pipe(
    map(([content, dayTours, multiDayTours, tab]) => {
      const lang = this.locale.activeLang();
      const activeTours = tab === 'day' ? dayTours : multiDayTours;
      return {
        content,
        dayTours,
        multiDayTours,
        tab,
        activeTours,
        lang,
        detailPath: tab === 'day' ? 'day-tour' : 'multi-day-tour',
        listPath: tab === 'day' ? 'day-tours' : 'multi-day-tours',
        listLabel: tab === 'day' ? 'Day Tours' : 'Multi-Day Tours',
      };
    }),
    tap((vm) => this.applySeo(vm)),
  );

  ngOnInit(): void {
    const lang = this.locale.activeLang();
    this.breadcrumbs.set([
      { label: 'Home', url: `/${lang}` },
      { label: 'Tours' },
    ]);

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const tabParam = params.get('tab') || params.get('duration');
      if (tabParam === 'multi-day' || tabParam === 'multi') {
        this.activeTab.set('multi-day');
      } else if (tabParam === 'day') {
        this.activeTab.set('day');
      }
    });

    this.destroyRef.onDestroy(() => this.breadcrumbs.clear());
  }

  setTab(tab: TourHubTab): void {
    this.activeTab.set(tab);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openQuickView(tour: Tour): void {
    this.quickViewTour.set(tour);
  }

  closeQuickView(): void {
    this.quickViewTour.set(null);
  }

  private applySeo(vm: {
    content: TourListPageContent;
    activeTours: Tour[];
    tab: TourHubTab;
    lang: string;
    listLabel: string;
  }): void {
    this.seo.update({
      title: vm.content.seo.metaTitle,
      description: vm.content.seo.metaDescription,
      keywords: vm.content.seo.keywords,
      path: 'sri-lanka-tours',
      image: vm.content.hero.image.src,
      type: 'website',
      jsonLd: buildGraph(
        buildBreadcrumbSchema([
          { name: 'Home', url: `${APP_CONFIG.siteUrl}/${vm.lang}` },
          { name: 'Tours', url: `${APP_CONFIG.siteUrl}/${vm.lang}/sri-lanka-tours` },
          {
            name: vm.listLabel,
            url: `${APP_CONFIG.siteUrl}/${vm.lang}/sri-lanka-tours?tab=${vm.tab}`,
          },
        ]),
        buildTourItemListSchema(vm.activeTours, vm.lang, vm.listLabel, 'sri-lanka-tours'),
      ),
    });
  }
}
