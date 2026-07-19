import { AsyncPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import type { BlogPost } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { BlogService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { TourService } from '../../../core/services/tour.service';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildGraph,
} from '../../../core/seo/schema/schema.builders';
import { SeoService } from '../../../core/seo/seo.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { TourRelatedComponent } from '../../tours/package-details/sections/tour-related/tour-related.component';

@Component({
  selector: 'app-blog-detail-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    BreadcrumbComponent,
    UiButtonComponent,
    UiContainerComponent,
    TourRelatedComponent,
  ],
  templateUrl: './blog-detail-page.component.html',
  styleUrl: './blog-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetailPageComponent {
  private readonly blogs = inject(BlogService);
  private readonly tours = inject(TourService);
  private readonly seo = inject(SeoService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly route = inject(ActivatedRoute);
  readonly locale = inject(LocaleService);

  readonly vm$ = this.route.paramMap.pipe(
    switchMap((params) => {
      const slug = params.get('slug') || '';
      return this.blogs.getBySlug(slug).pipe(
        switchMap((post) => {
          if (!post) {
            return of({
              post: null as BlogPost | null,
              paragraphs: [] as string[],
              related: [],
              lang: this.locale.activeLang(),
              slug,
            });
          }
          const paragraphs = post.content
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean);
          return this.tours.getBySlugs(post.relatedTourSlugs || []).pipe(
            map((related) => ({
              post,
              paragraphs,
              related,
              lang: this.locale.activeLang(),
              slug,
            })),
          );
        }),
      );
    }),
    tap((vm) => {
      if (vm.post) {
        this.applySeo(vm.post, vm.lang);
        this.breadcrumbs.set([
          { label: 'Home', url: `/${vm.lang}` },
          { label: 'Journal', url: `/${vm.lang}/blog` },
          { label: vm.post.title },
        ]);
      } else {
        this.breadcrumbs.set([
          { label: 'Home', url: `/${vm.lang}` },
          { label: 'Journal', url: `/${vm.lang}/blog` },
          { label: 'Not found' },
        ]);
        this.seo.update({
          title: 'Article not found | Hai Sri Lanka Tours',
          description: 'This journal article could not be found.',
          path: `blog/${vm.slug}`,
          noIndex: true,
          jsonLd: null,
        });
      }
    }),
  );

  private applySeo(post: BlogPost, lang: string): void {
    const path = `blog/${post.slug}`;
    this.seo.update({
      title: post.seo.metaTitle,
      description: post.seo.metaDescription,
      keywords: post.seo.keywords,
      path,
      image: post.images[0]?.src,
      type: 'article',
      jsonLd: buildGraph(
        buildBreadcrumbSchema([
          { name: 'Home', url: `/${lang}` },
          { name: 'Journal', url: `/${lang}/blog` },
          { name: post.title, url: `/${lang}/${path}` },
        ]),
        buildArticleSchema(post, lang),
      ),
    });
  }
}
