import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { UiContainerComponent } from '../../shared/ui/container/ui-container.component';
import { UiHeadingComponent } from '../../shared/ui/heading/ui-heading.component';
import { UiSectionComponent } from '../../shared/ui/section/ui-section.component';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { PageSeoFacade } from '../../core/seo/page-seo.facade';
import { LocaleService } from '../../core/services/locale.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    UiContainerComponent,
    UiHeadingComponent,
    UiSectionComponent,
    UiButtonComponent,
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent implements OnInit {
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly router = inject(Router);
  readonly locale = inject(LocaleService);

  ngOnInit(): void {
    this.breadcrumbs.set([{ label: '404' }]);
    const url = this.router.url.replace(/^\//, '');
    // Keep a unique path (not homepage) and block indexing.
    void this.seo.applyTranslatedPage('notFound', url || '404', {
      includeWebsite: false,
      noIndex: true,
    });
  }
}
