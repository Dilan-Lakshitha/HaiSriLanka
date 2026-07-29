import { AsyncPipe, CurrencyPipe, DatePipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom, map } from 'rxjs';
import type { BookingConfirmationDetails } from '../../../core/models';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { CompanyService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { SeoService } from '../../../core/seo/seo.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';

@Component({
  selector: 'app-booking-confirmation-page',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    TranslocoPipe,
    BreadcrumbComponent,
    UiButtonComponent,
    UiContainerComponent,
  ],
  templateUrl: './booking-confirmation-page.component.html',
  styleUrl: './booking-confirmation-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingConfirmationPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingState = inject(BookingStateService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly company = inject(CompanyService);
  private readonly seo = inject(SeoService);
  private readonly transloco = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly locale = inject(LocaleService);

  readonly company$ = this.company.getCompany();
  readonly issuedNow = new Date();

  private readonly routeRef = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('ref') || '')),
    { initialValue: '' },
  );
  private readonly routeSlug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('tourSlug') || '')),
    { initialValue: '' },
  );

  readonly confirmation = computed(() => {
    const stored = this.bookingState.confirmation();
    if (!stored) return null;
    const ref = this.routeRef();
    const slug = this.routeSlug();
    if (ref && stored.bookingRef !== ref) return null;
    if (slug && stored.tourSlug !== slug) return null;
    return stored;
  });

  ngOnInit(): void {
    this.hydrateFromNavigationState();
    void this.applyLocalizedChrome();
  }

  private async applyLocalizedChrome(): Promise<void> {
    const lang = this.locale.activeLang();
    try {
      await firstValueFrom(this.transloco.load(lang));
    } catch {
      /* fall through — translate() returns keys if load fails */
    }

    this.breadcrumbs.set([
      { label: this.transloco.translate('nav.home'), url: `/${lang}` },
      { label: this.transloco.translate('bookingConfirm.breadcrumb') },
    ]);

    void this.seo.update({
      title: this.transloco.translate('bookingConfirm.seoTitle'),
      description: this.transloco.translate('bookingConfirm.seoDescription'),
      path: `booking/${this.routeSlug()}/confirmation/${this.routeRef()}`,
      noIndex: true,
    });
  }

  whatsappLink(whatsapp?: string, phone?: string): string | null {
    const digits = (whatsapp || phone || '').replace(/\D/g, '');
    if (!digits) return null;
    const conf = this.confirmation();
    const text = conf
      ? this.transloco.translate('bookingConfirm.whatsappPrefill', {
          ref: conf.bookingRef,
          tour: conf.tourTitle,
        })
      : this.transloco.translate('bookingConfirm.whatsappPrefillGeneric');
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }

  printInvoice(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.print();
  }

  private hydrateFromNavigationState(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Angular 19+: lastSuccessfulNavigation is a Signal
    const nav = this.router.lastSuccessfulNavigation();
    const fromRouter = nav?.extras?.state?.['confirmation'] as
      | BookingConfirmationDetails
      | undefined;
    const fromHistory =
      (history.state?.['confirmation'] as BookingConfirmationDetails | undefined) ||
      undefined;
    const details = fromRouter || fromHistory;
    if (details?.bookingRef) {
      this.bookingState.setConfirmation(details);
    }
  }
}
