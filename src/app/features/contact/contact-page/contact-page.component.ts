import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { map, tap } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app.config';
import { RevealDirective } from '../../../core/directives/reveal.directive';
import type { CompanyInfo, ImageAsset } from '../../../core/models';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { ContactApiService } from '../../../core/services/contact-api.service';
import { CompanyService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { absUrl } from '../../../core/seo/schema/schema.builders';
import { PageSeoFacade } from '../../../core/seo/page-seo.facade';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';

const HERO_IMAGE: ImageAsset = {
  src: '/assets/images/destinations/colombo.webp',
  alt: 'Colombo waterfront and city skyline, Sri Lanka',
  title: 'Colombo',
  width: 1600,
  height: 900,
};

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    FormsModule,
    RouterLink,
    RevealDirective,
    BreadcrumbComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPageComponent implements OnInit {
  private readonly companyService = inject(CompanyService);
  private readonly contactApi = inject(ContactApiService);
  private readonly seo = inject(PageSeoFacade);
  private readonly breadcrumbs = inject(BreadcrumbService);
  readonly locale = inject(LocaleService);

  readonly heroImage = HERO_IMAGE;

  readonly name = signal('');
  readonly email = signal('');
  readonly whatsapp = signal('');
  readonly message = signal('');
  readonly submittedAttempt = signal(false);
  readonly submitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly formValid = computed(() => {
    const nameOk = this.name().trim().length >= 2;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim());
    const waDigits = this.whatsapp().replace(/\D/g, '');
    const whatsappOk = waDigits.length >= 8;
    const messageOk = this.message().trim().length >= 10;
    return nameOk && emailOk && whatsappOk && messageOk;
  });

  readonly vm$ = this.companyService.getCompany().pipe(
    map((company) => ({
      company,
      lang: this.locale.activeLang(),
      phone: company.phone[0] ?? '',
      telHref: company.phone[0]
        ? `tel:${company.phone[0].replace(/\s+/g, '')}`
        : '',
      mailtoHref: `mailto:${company.email}`,
      whatsappHref: company.whatsapp
        ? `https://wa.me/${company.whatsapp.replace(/\D/g, '')}`
        : '',
    })),
    tap((vm) => this.applySeo(vm.company, vm.lang)),
  );

  ngOnInit(): void {
    const lang = this.locale.activeLang();
    this.breadcrumbs.set([
      { label: 'Home', url: `/${lang}` },
      { label: 'Contact' },
    ]);
  }

  submit(): void {
    this.submittedAttempt.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.formValid() || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.contactApi
      .submit({
        name: this.name().trim(),
        email: this.email().trim(),
        whatsapp: this.whatsapp().trim(),
        message: this.message().trim(),
        locale: this.locale.activeLang(),
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.successMessage.set(
            res.message || 'Thank you your message has been sent.',
          );
          this.name.set('');
          this.email.set('');
          this.whatsapp.set('');
          this.message.set('');
          this.submittedAttempt.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          const apiMessage =
            typeof err.error?.message === 'string' ? err.error.message : null;
          this.errorMessage.set(
            apiMessage ||
              'Could not send your message right now. Please try WhatsApp or email us directly.',
          );
        },
      });
  }

  private applySeo(company: CompanyInfo, lang: string): void {
    void this.seo.applyTranslatedPage('contact', 'contact', {
      breadcrumbs: [
        { name: 'Home' },
        { name: 'nav.contact', path: 'contact' },
      ],
      extraNodes: [
        {
          '@type': 'ContactPage',
          name: 'Contact Hai Sri Lanka Tours',
          url: absUrl(`/${lang}/contact`),
          description:
            'Contact Hai Sri Lanka Tours by form, phone, WhatsApp, or email to plan a private Sri Lanka journey.',
          mainEntity: {
            '@type': 'TravelAgency',
            name: company.brandName,
            email: company.email,
            telephone: company.phone[0],
            url: APP_CONFIG.siteUrl,
          },
        },
      ],
    });
  }
}
