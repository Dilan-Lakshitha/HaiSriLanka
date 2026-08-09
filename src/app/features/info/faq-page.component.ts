import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom, map, tap } from 'rxjs';
import { RevealDirective } from '../../core/directives/reveal.directive';
import type { FaqItem, ImageAsset } from '../../core/models';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { FaqService } from '../../core/services/content.services';
import { LocaleService } from '../../core/services/locale.service';
import { buildFaqSchema } from '../../core/seo/schema/schema.builders';
import { PageSeoFacade } from '../../core/seo/page-seo.facade';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../shared/ui/container/ui-container.component';

const HERO: ImageAsset = {
  src: '/assets/images/hero/carousel-nine-arch-ella.webp',
  alt: 'Nine Arch Bridge in Ella, Sri Lanka',
  width: 1920,
  height: 1080,
};

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    TranslocoPipe,
    BreadcrumbComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPageComponent implements OnInit {
  private readonly faqs = inject(FaqService);
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = inject(LocaleService);
  readonly heroImage = HERO;

  readonly vm$ = this.faqs.getDataset().pipe(
    map((dataset) => {
      const extra =
        dataset.pages.find((p) => p.pageKey === 'faq')?.items ?? [];
      const home = dataset.pages.find((p) => p.pageKey === 'home')?.items ?? [];
      const items = uniqueFaqs([...dataset.global, ...home, ...extra]);
      return { items, lang: this.locale.activeLang() };
    }),
    tap((vm) => void this.applySeo(vm.items, vm.lang)),
  );

  ngOnInit(): void {
    void this.setBreadcrumbs();
  }

  private async setBreadcrumbs(): Promise<void> {
    const lang = this.locale.activeLang();
    await firstValueFrom(this.transloco.load(lang));
    this.breadcrumbs.set([
      { label: this.transloco.translate('nav.home'), url: `/${lang}` },
      { label: this.transloco.translate('nav.faq') },
    ]);
  }

  private async applySeo(items: FaqItem[], lang: string): Promise<void> {
    await firstValueFrom(this.transloco.load(lang));
    void this.seo.applyTranslatedPage('faq', 'faq', {
      breadcrumbs: [{ name: 'nav.home' }, { name: 'nav.faq', path: 'faq' }],
      extraNodes: [buildFaqSchema(items)],
    });
  }
}

function uniqueFaqs(items: FaqItem[]): FaqItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.question.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
