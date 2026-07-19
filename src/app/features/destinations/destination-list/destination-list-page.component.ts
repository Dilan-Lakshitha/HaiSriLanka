import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest, map, tap } from 'rxjs';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import type { Destination } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { DestinationService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import {
  absUrl,
  buildBreadcrumbSchema,
  buildGraph,
} from '../../../core/seo/schema/schema.builders';
import { SeoService } from '../../../core/seo/seo.service';
import { DestinationCardComponent } from '../../../shared/cards/destination-card/destination-card.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';

@Component({
  selector: 'app-destination-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    BreadcrumbComponent,
    DestinationCardComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './destination-list-page.component.html',
  styleUrl: './destination-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestinationListPageComponent implements OnInit {
  private readonly destinations = inject(DestinationService);
  private readonly seo = inject(SeoService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  readonly locale = inject(LocaleService);

  readonly regionFilter = signal('all');

  readonly vm$ = combineLatest([
    this.destinations.getAll(),
    toObservable(this.regionFilter),
  ]).pipe(
    map(([items, region]) => {
      const lang = this.locale.activeLang();
      const regions = [...new Set(items.map((d) => d.region).filter(Boolean))].sort();
      const filtered =
        region === 'all' ? items : items.filter((d) => d.region === region);
      return {
        items,
        filtered,
        regions,
        region,
        lang,
        heroImage:
          items[0]?.images[0] ?? {
            src: '/assets/images/destinations/ella-bridge.webp',
            alt: 'Sri Lanka destinations',
            width: 1600,
            height: 900,
          },
      };
    }),
    tap((vm) => this.applySeo(vm.lang, vm.filtered)),
  );

  ngOnInit(): void {
    const lang = this.locale.activeLang();
    this.breadcrumbs.set([
      { label: 'Home', url: `/${lang}` },
      { label: 'Destinations' },
    ]);
  }

  setRegion(region: string): void {
    this.regionFilter.set(region);
  }

  private applySeo(lang: string, items: Destination[]): void {
    const path = 'destinations';
    this.seo.update({
      title: 'Sri Lanka Destinations | Hai Sri Lanka Tours',
      description:
        'Explore Sri Lanka’s defining destinations Galle, Sigiriya, Kandy, Yala, Ella, and more with private tours by Hai Sri Lanka.',
      keywords: [
        'Sri Lanka destinations',
        'Galle',
        'Sigiriya',
        'Kandy',
        'Yala',
        'Ella',
      ],
      path,
      image: items[0]?.images[0]?.src,
      type: 'website',
      jsonLd: buildGraph(
        buildBreadcrumbSchema([
          { name: 'Home', url: `/${lang}` },
          { name: 'Destinations', url: `/${lang}/${path}` },
        ]),
        {
          '@type': 'ItemList',
          name: 'Sri Lanka Destinations',
          numberOfItems: items.length,
          itemListElement: items.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.title,
            url: absUrl(`/${lang}/destinations/${d.slug}`),
          })),
        },
      ),
    });
  }
}
