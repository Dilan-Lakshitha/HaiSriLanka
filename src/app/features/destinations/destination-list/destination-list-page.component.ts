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
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { combineLatest, firstValueFrom, map, tap } from 'rxjs';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import type { Destination } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { DestinationService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { absUrl } from '../../../core/seo/schema/schema.builders';
import { PageSeoFacade } from '../../../core/seo/page-seo.facade';
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
    TranslocoPipe,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './destination-list-page.component.html',
  styleUrl: './destination-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestinationListPageComponent implements OnInit {
  private readonly destinations = inject(DestinationService);
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
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
    void this.setBreadcrumbs();
  }

  private async setBreadcrumbs(): Promise<void> {
    const lang = this.locale.activeLang();
    await firstValueFrom(this.transloco.load(lang));
    this.breadcrumbs.set([
      { label: this.transloco.translate('nav.home'), url: `/${lang}` },
      { label: this.transloco.translate('nav.destinations') },
    ]);
  }

  setRegion(region: string): void {
    this.regionFilter.set(region);
  }

  private applySeo(lang: string, items: Destination[]): void {
    void this.applySeoAsync(lang, items);
  }

  private async applySeoAsync(lang: string, items: Destination[]): Promise<void> {
    await firstValueFrom(this.transloco.load(lang));
    const path = 'destinations';
    void this.seo.applyTranslatedPage('destinations', path, {
      breadcrumbs: [
        { name: 'nav.home' },
        { name: 'nav.destinations', path },
      ],
      image: items[0]?.images[0]?.src,
      extraNodes: [
        {
          '@type': 'ItemList',
          name: this.transloco.translate('destinationsPage.schemaName'),
          inLanguage: lang,
          numberOfItems: items.length,
          itemListElement: items.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.title,
            url: absUrl(`/${lang}/destinations/${d.slug}`),
          })),
        },
      ],
    });
  }
}
