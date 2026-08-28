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
import { TranslocoService } from '@jsverse/transloco';
import { combineLatest, firstValueFrom, map, tap } from 'rxjs';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import type { Experience } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { ExperienceService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { absUrl } from '../../../core/seo/schema/schema.builders';
import { PageSeoFacade } from '../../../core/seo/page-seo.facade';
import { ExperienceCardComponent } from '../../../shared/cards/experience-card/experience-card.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';

@Component({
  selector: 'app-experience-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    BreadcrumbComponent,
    ExperienceCardComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './experience-list-page.component.html',
  styleUrl: './experience-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceListPageComponent implements OnInit {
  private readonly experiences = inject(ExperienceService);
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = inject(LocaleService);

  readonly categoryFilter = signal('all');

  readonly vm$ = combineLatest([
    this.experiences.getAll(),
    toObservable(this.categoryFilter),
  ]).pipe(
    map(([items, category]) => {
      const lang = this.locale.activeLang();
      const categories = [...new Set(items.map((e) => e.category).filter(Boolean))].sort();
      const filtered =
        category === 'all' ? items : items.filter((e) => e.category === category);
      return {
        items,
        filtered,
        categories,
        category,
        lang,
        heroImage:
          items[0]?.images[0] ?? {
            src: '/assets/images/tours/guest-experiences/safari-elephant-herd.png',
            alt: 'Sri Lanka experiences',
            width: 1600,
            height: 1200,
          },
      };
    }),
    tap((vm) => this.applySeo(vm.lang, vm.filtered)),
  );

  ngOnInit(): void {
    void this.setBreadcrumbs();
  }

  setCategory(category: string): void {
    this.categoryFilter.set(category);
  }

  private async setBreadcrumbs(): Promise<void> {
    const lang = this.locale.activeLang();
    await firstValueFrom(this.transloco.load(lang));
    this.breadcrumbs.set([
      { label: this.transloco.translate('nav.home'), url: `/${lang}` },
      { label: this.transloco.translate('nav.experiences') },
    ]);
  }

  private applySeo(lang: string, items: Experience[]): void {
    void this.applySeoAsync(lang, items);
  }

  private async applySeoAsync(lang: string, items: Experience[]): Promise<void> {
    await firstValueFrom(this.transloco.load(lang));
    const path = 'things-to-do';
    void this.seo.applyTranslatedPage('thingsToDo', path, {
      breadcrumbs: [
        { name: 'nav.home' },
        { name: 'nav.experiences', path },
      ],
      image: items[0]?.images[0]?.src,
      extraNodes: [
        {
          '@type': 'ItemList',
          name: this.transloco.translate('seo.thingsToDo.title'),
          inLanguage: lang,
          numberOfItems: items.length,
          itemListElement: items.map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: e.title,
            url: absUrl(`/${lang}/things-to-do/${e.slug}`),
          })),
        },
      ],
    });
  }
}
