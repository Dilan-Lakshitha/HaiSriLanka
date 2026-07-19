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
import type { BlogPost } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BlogService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import {
  absUrl,
  buildBreadcrumbSchema,
  buildGraph,
} from '../../../core/seo/schema/schema.builders';
import { SeoService } from '../../../core/seo/seo.service';
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
  private readonly seo = inject(SeoService);
  private readonly breadcrumbs = inject(BreadcrumbService);
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
    const lang = this.locale.activeLang();
    this.breadcrumbs.set([
      { label: 'Home', url: `/${lang}` },
      { label: 'Journal' },
    ]);
  }

  setTag(tag: string): void {
    this.tagFilter.set(tag);
  }

  private applySeo(lang: string, posts: BlogPost[]): void {
    const path = 'blog';
    this.seo.update({
      title: 'Travel Journal | Sri Lanka Tips & Guides | Hai Sri Lanka',
      description:
        'Ideas for your Sri Lanka trip seasons, packing, private travel, Ella, safari tips, and temple etiquette from Hai Sri Lanka.',
      keywords: [
        'Sri Lanka travel blog',
        'Sri Lanka travel tips',
        'Hai Sri Lanka journal',
      ],
      path,
      image: posts[0]?.images[0]?.src,
      type: 'website',
      jsonLd: buildGraph(
        buildBreadcrumbSchema([
          { name: 'Home', url: `/${lang}` },
          { name: 'Journal', url: `/${lang}/${path}` },
        ]),
        {
          '@type': 'ItemList',
          name: 'Hai Sri Lanka Travel Journal',
          numberOfItems: posts.length,
          itemListElement: posts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: absUrl(`/${lang}/blog/${p.slug}`),
          })),
        },
      ),
    });
  }
}
