import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { Tour } from '../../../../../core/models';
import { tourPriceMap } from '../../../../../core/models/tour.model';
import { BookingStateService } from '../../../../../core/services/booking-state.service';
import { CompanyService } from '../../../../../core/services/content.services';
import { LocaleService } from '../../../../../core/services/locale.service';
import { PricingService } from '../../../../../core/services/pricing.service';
import { UiButtonComponent } from '../../../../../shared/ui/button/ui-button.component';

type TravelerOption = 1 | 2 | 3 | 4 | 5;

const COUNTRIES = [
  'Sri Lanka',
  'United Kingdom',
  'United States',
  'Germany',
  'France',
  'Netherlands',
  'Australia',
  'India',
  'Japan',
  'China',
  'Other',
] as const;

@Component({
  selector: 'app-tour-booking',
  standalone: true,
  imports: [CurrencyPipe, AsyncPipe, FormsModule, UiButtonComponent],
  templateUrl: './tour-booking.component.html',
  styleUrl: './tour-booking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourBookingComponent implements OnInit {
  readonly tour = input.required<Tour>();

  private readonly pricing = inject(PricingService);
  private readonly bookingState = inject(BookingStateService);
  private readonly company = inject(CompanyService);
  private readonly locale = inject(LocaleService);
  private readonly router = inject(Router);

  readonly travelerOptions: TravelerOption[] = [1, 2, 3, 4, 5];
  readonly countries = COUNTRIES;

  readonly travelers = signal<TravelerOption>(2);
  readonly travelDate = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly country = signal('');
  readonly agreed = signal(false);
  readonly submittedAttempt = signal(false);

  readonly priceTable = computed(() => tourPriceMap(this.tour()));
  readonly pricePerPerson = computed(() =>
    this.pricing.getPricePerPerson(this.priceTable(), this.travelers()),
  );
  readonly totalPrice = computed(() =>
    this.pricing.getTotal(this.priceTable(), this.travelers()),
  );

  readonly formValid = computed(() => {
    return (
      this.travelers() >= 1 &&
      Boolean(this.travelDate().trim()) &&
      Boolean(this.firstName().trim()) &&
      Boolean(this.lastName().trim()) &&
      Boolean(this.email().trim()) &&
      Boolean(this.phone().trim()) &&
      Boolean(this.country().trim()) &&
      this.agreed()
    );
  });

  readonly company$ = this.company.getCompany();

  ngOnInit(): void {
    this.bookingState.selectTour(this.tour().slug, this.priceTable(), this.tour().currency);
  }

  onTravelersChange(count: number): void {
    const next = Math.min(Math.max(count, 1), 5) as TravelerOption;
    this.travelers.set(next);
    this.bookingState.setTravelersCount(next);
  }

  onDateChange(value: string): void {
    this.travelDate.set(value);
    this.bookingState.setTravelDate(value);
  }

  whatsappLink(whatsapp?: string, phone?: string): string | null {
    const digits = (whatsapp || phone || '').replace(/\D/g, '');
    if (!digits) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(this.buildInquiryMessage())}`;
  }

  completeBooking(): void {
    this.submittedAttempt.set(true);
    if (!this.formValid()) {
      return;
    }

    this.bookingState.setTravelDate(this.travelDate());
    this.bookingState.setPrimaryTraveler({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      nationality: this.country().trim(),
    });

    void this.router.navigate(['/', this.locale.activeLang(), 'booking', this.tour().slug]);
  }

  private buildInquiryMessage(): string {
    const parts = [
      `Hello Hai Sri Lanka interested in "${this.tour().title}".`,
      `Travelers: ${this.travelers()}`,
      this.travelDate() ? `Date: ${this.travelDate()}` : null,
      this.firstName() || this.lastName()
        ? `Name: ${`${this.firstName()} ${this.lastName()}`.trim()}`
        : null,
      this.email() ? `Email: ${this.email()}` : null,
      this.phone() ? `Phone: ${this.phone()}` : null,
      `Est. total: ${this.tour().currency} ${this.totalPrice()}`,
    ].filter(Boolean);
    return parts.join('\n');
  }
}
