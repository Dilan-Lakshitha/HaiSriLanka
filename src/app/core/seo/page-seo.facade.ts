import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SeoService } from '../seo/seo.service';
import { LocaleService } from '../services/locale.service';
import { CompanyService } from '../services/content.services';
import {
  buildGraph,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildBreadcrumbSchema,
} from '../seo/schema/schema.builders';
import { APP_CONFIG } from '../config/app.config';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PageSeoFacade {
  private readonly seo = inject(SeoService);
  private readonly transloco = inject(TranslocoService);
  private readonly locale = inject(LocaleService);
  private readonly company = inject(CompanyService);

  async applyTranslatedPage(
    seoKey: string,
    path: string,
    extras?: {
      breadcrumbs?: Array<{ name: string; path?: string }>;
      includeWebsite?: boolean;
      extraNodes?: Array<Record<string, unknown>>;
      noIndex?: boolean;
      image?: string;
    },
  ): Promise<void> {
    const lang = this.locale.activeLang();
    await firstValueFrom(this.transloco.load(lang));
    const title = this.transloco.translate(`seo.${seoKey}.title`);
    const description = this.transloco.translate(`seo.${seoKey}.description`);
    const company = await firstValueFrom(this.company.getCompany());

    const crumbs = (extras?.breadcrumbs ?? []).map((b) => {
      const name = b.name.includes('.')
        ? this.transloco.translate(b.name)
        : b.name;
      return {
        name,
        url: b.path
          ? `${APP_CONFIG.siteUrl}/${lang}/${b.path}`
          : `${APP_CONFIG.siteUrl}/${lang}`,
      };
    });

    const graph = buildGraph(
      buildOrganizationSchema(company),
      buildLocalBusinessSchema(company),
      extras?.includeWebsite ? buildWebSiteSchema() : null,
      crumbs.length ? buildBreadcrumbSchema(crumbs) : null,
      ...(extras?.extraNodes ?? []),
    );

    this.seo.update({
      title,
      description,
      path,
      image: extras?.image,
      noIndex: extras?.noIndex ?? false,
      jsonLd: graph,
    });
  }
}
