import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BookingStateService } from '../../../core/services/booking-state.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { CompanyService } from '../../../core/services/content.services';
import { LocaleService } from '../../../core/services/locale.service';
import { SeoService } from '../../../core/seo/seo.service';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../shared/ui/container/ui-container.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-booking-confirmation-page',
  standalone: true,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    RouterLink,
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
  private readonly bookingState = inject(BookingStateService);
  private readonly breadcrumbs = inject(BreadcrumbService);
  private readonly company = inject(CompanyService);
  private readonly seo = inject(SeoService);
  readonly locale = inject(LocaleService);

  readonly company$ = this.company.getCompany();

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
    const lang = this.locale.activeLang();
    this.breadcrumbs.set([
      { label: 'Home', url: `/${lang}` },
      { label: 'Booking confirmation' },
    ]);

    void this.seo.update({
      title: 'Booking confirmation | Hai Sri Lanka Tours',
      description:
        'Your Hai Sri Lanka Tours booking request has been received. Review your booking details and reference number.',
      path: `booking/${this.routeSlug()}/confirmation/${this.routeRef()}`,
      noIndex: true,
    });
  }

  whatsappLink(whatsapp?: string, phone?: string): string | null {
    const digits = (whatsapp || phone || '').replace(/\D/g, '');
    if (!digits) return null;
    const conf = this.confirmation();
    const text = conf
      ? `Hello Hai Sri Lanka — regarding booking ${conf.bookingRef} (${conf.tourTitle}).`
      : 'Hello Hai Sri Lanka — I have a question about my booking.';
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }
}
