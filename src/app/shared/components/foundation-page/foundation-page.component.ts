import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { UiHeadingComponent } from '../../../shared/ui/heading/ui-heading.component';
import { UiSectionComponent } from '../../../shared/ui/section/ui-section.component';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PageSeoFacade } from '../../../core/seo/page-seo.facade';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { LocaleService } from '../../../core/services/locale.service';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-foundation-page',
  standalone: true,
  imports: [
    TranslocoPipe,
    RouterLink,
    UiContainerComponent,
    UiHeadingComponent,
    UiSectionComponent,
    BreadcrumbComponent,
    UiButtonComponent,
  ],
  templateUrl: './foundation-page.component.html',
  styleUrl: './foundation-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundationPageComponent implements OnInit {
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly transloco = inject(TranslocoService);
  readonly locale = inject(LocaleService);

  readonly pageTitleKey = input.required<string>();
  readonly seoKey = input.required<string>();
  readonly path = input.required<string>();

  ngOnInit(): void {
    const title = this.transloco.translate(this.pageTitleKey());
    this.breadcrumbs.set([
      { label: 'Home', url: `/${this.locale.activeLang()}` },
      { label: title },
    ]);
    void this.seo.applyTranslatedPage(this.seoKey(), this.path(), {
      breadcrumbs: [
        { name: 'Home' },
        { name: this.pageTitleKey(), path: this.path() || undefined },
      ],
      includeWebsite: this.path() === '',
      // Coming-soon stubs should not compete with real content in Google.
      noIndex: true,
    });
  }
}
