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
import type { BlogPost } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BlogService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { absUrl } from '../../../core/seo/schema/schema.builders';
import { PageSeoFacade } from '../../../core/seo/page-seo.facade';
import { BlogCardComponent } from '../../../shared/cards/blog-card/blog-card.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';

@Component({
  selector: 'app-blog-list-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    BreadcrumbComponent,
    BlogCardComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './blog-list-page.component.html',
  styleUrl: './blog-list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListPageComponent implements OnInit {
  private readonly blogs = inject(BlogService);
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = inject(LocaleService);

  readonly tagFilter = signal('all');

  readonly vm$ = combineLatest([
    this.blogs.getAll(),
    toObservable(this.tagFilter),
  ]).pipe(
    map(([posts, tag]) => {
      const lang = this.locale.activeLang();
      const tags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();
      const filtered =
        tag === 'all' ? posts : posts.filter((p) => p.tags?.includes(tag));
      return {
        posts,
        filtered,
        tags,
        tag,
        lang,
        heroImage:
          posts[0]?.images[0] ?? {
            src: '/assets/images/blog/best-time-to-visit.webp',
            alt: 'Travel journal',
            width: 1400,
            height: 788,
          },
      };
    }),
    tap((vm) => this.applySeo(vm.lang, vm.filtered)),
  );

  ngOnInit(): void {
    void this.setBreadcrumbs();
  }

  setTag(tag: string): void {
    this.tagFilter.set(tag);
  }

  private async setBreadcrumbs(): Promise<void> {
    const lang = this.locale.activeLang();
    await firstValueFrom(this.transloco.load(lang));
    this.breadcrumbs.set([
      { label: this.transloco.translate('nav.home'), url: `/${lang}` },
      { label: this.transloco.translate('nav.blog') },
    ]);
  }

  private applySeo(lang: string, posts: BlogPost[]): void {
    void this.applySeoAsync(lang, posts);
  }

  private async applySeoAsync(lang: string, posts: BlogPost[]): Promise<void> {
    await firstValueFrom(this.transloco.load(lang));
    const path = 'blog';
    void this.seo.applyTranslatedPage('blog', path, {
      breadcrumbs: [
        { name: 'nav.home' },
        { name: 'nav.blog', path },
      ],
      image: posts[0]?.images[0]?.src,
      extraNodes: [
        {
          '@type': 'ItemList',
          name: this.transloco.translate('seo.blog.title'),
          inLanguage: lang,
          numberOfItems: posts.length,
          itemListElement: posts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: absUrl(`/${lang}/blog/${p.slug}`),
          })),
        },
      ],
    });
  }
}
