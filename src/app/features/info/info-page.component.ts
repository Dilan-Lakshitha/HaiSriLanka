import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '../../core/config/app.config';
import { RevealDirective } from '../../core/directives/reveal.directive';
import type { ImageAsset } from '../../core/models';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { LocaleService } from '../../core/services/locale.service';
import { PageSeoFacade } from '../../core/seo/page-seo.facade';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../shared/ui/container/ui-container.component';

export type InfoPageKind = 'about' | 'privacy' | 'terms';

const HERO: Record<InfoPageKind, ImageAsset> = {
  about: {
    src: '/assets/images/hero/carousel-guest-moments.webp',
    alt: 'Guests traveling in Sri Lanka with Hai Sri Lanka Tours',
    width: 1920,
    height: 1080,
  },
  privacy: {
    src: '/assets/images/destinations/colombo.webp',
    alt: 'Colombo waterfront, Sri Lanka',
    width: 1600,
    height: 900,
  },
  terms: {
    src: '/assets/images/destinations/galle.webp',
    alt: 'Galle Fort coastline, Sri Lanka',
    width: 1400,
    height: 1050,
  },
};

@Component({
  selector: 'app-info-page',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    TranslocoPipe,
    BreadcrumbComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './info-page.component.html',
  styleUrl: './info-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPageComponent implements OnInit {
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = inject(LocaleService);

  readonly kind = input.required<InfoPageKind>();
  readonly seoKey = input.required<string>();
  readonly path = input.required<string>();

  readonly prefix = computed(() => `${this.kind()}Page`);
  readonly hero = computed(() => HERO[this.kind()]);
  readonly isAbout = computed(() => this.kind() === 'about');
  readonly sections = signal<Array<{ title: string; body: string }>>([]);
  readonly values = signal<Array<{ title: string; body: string }>>([]);

  ngOnInit(): void {
    void this.boot();
  }

  private async boot(): Promise<void> {
    const lang = this.locale.activeLang();
    const kind = this.kind();
    const path = this.path();
    await firstValueFrom(this.transloco.load(lang));

    const navKey =
      kind === 'about' ? 'nav.about' : kind === 'privacy' ? 'nav.privacy' : 'nav.terms';
    this.breadcrumbs.set([
      { label: this.transloco.translate('nav.home'), url: `/${lang}` },
      { label: this.transloco.translate(navKey) },
    ]);

    const sections = this.transloco.translate(`${kind}Page.sections`);
    this.sections.set(Array.isArray(sections) ? sections : []);
    const values = this.transloco.translate(`${kind}Page.values`);
    this.values.set(Array.isArray(values) ? values : []);

    void this.seo.applyTranslatedPage(this.seoKey(), path, {
      breadcrumbs: [{ name: 'nav.home' }, { name: navKey, path }],
      extraNodes:
        kind === 'about'
          ? [
              {
                '@type': 'AboutPage',
                name: this.transloco.translate('aboutPage.schemaName'),
                description: this.transloco.translate('seo.about.description'),
                url: `${APP_CONFIG.siteUrl}/${lang}/about`,
                inLanguage: lang,
              },
            ]
          : [
              {
                '@type': 'WebPage',
                name: this.transloco.translate(`seo.${this.seoKey()}.title`),
                description: this.transloco.translate(`seo.${this.seoKey()}.description`),
                url: `${APP_CONFIG.siteUrl}/${lang}/${path}`,
                inLanguage: lang,
              },
            ],
    });
  }
}
