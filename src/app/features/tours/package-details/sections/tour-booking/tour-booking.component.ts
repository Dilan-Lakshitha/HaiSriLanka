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
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import type { Tour } from '../../../../../core/models';
import { tourPriceMap } from '../../../../../core/models/tour.model';
import { BookingApiService } from '../../../../../core/services/booking-api.service';
import { BookingStateService } from '../../../../../core/services/booking-state.service';
import { CompanyService } from '../../../../../core/services/content.services';
import { LocaleService } from '../../../../../core/services/locale.service';
import { PricingService } from '../../../../../core/services/pricing.service';
import { UiButtonComponent } from '../../../../../shared/ui/button/ui-button.component';

/** 1–5 = priced group; 6 = 6+ travelers (custom quote) */
type TravelerOption = 1 | 2 | 3 | 4 | 5 | 6;

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
  private readonly bookingApi = inject(BookingApiService);
  private readonly company = inject(CompanyService);
  private readonly locale = inject(LocaleService);

  readonly travelerOptions: TravelerOption[] = [1, 2, 3, 4, 5, 6];
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
  readonly submitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly bookingRef = signal('');

  readonly priceTable = computed(() => tourPriceMap(this.tour()));
  readonly needsCustomQuote = computed(() => this.travelers() >= 6);
  readonly pricePerPerson = computed(() =>
    this.needsCustomQuote()
      ? 0
      : this.pricing.getPricePerPerson(this.priceTable(), this.travelers()),
  );
  readonly totalPrice = computed(() =>
    this.needsCustomQuote() ? 0 : this.pricing.getTotal(this.priceTable(), this.travelers()),
  );

  readonly formValid = computed(() => {
    if (this.needsCustomQuote()) {
      return false;
    }
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

  travelerLabel(option: TravelerOption): string {
    return option >= 6 ? '6+' : String(option);
  }

  onTravelersChange(count: number): void {
    const next = Math.min(Math.max(count, 1), 6) as TravelerOption;
    this.travelers.set(next);
    if (next === 1 || next === 2 || next === 3 || next === 4 || next === 5) {
      this.bookingState.setTravelersCount(next);
    }
  }

  onDateChange(value: string): void {
    this.travelDate.set(value);
    this.bookingState.setTravelDate(value);
  }

  formatPhone(phone?: string): string {
    return (phone || '').trim();
  }

  whatsappLink(whatsapp?: string, phone?: string): string | null {
    const digits = (whatsapp || phone || '').replace(/\D/g, '');
    if (!digits) return null;
    return `https://wa.me/${digits}?text=${encodeURIComponent(this.buildInquiryMessage())}`;
  }

  mailtoLink(email?: string): string | null {
    if (!email?.trim()) return null;
    const subject = encodeURIComponent(`Group tour inquiry: ${this.tour().title}`);
    const body = encodeURIComponent(this.buildInquiryMessage());
    return `mailto:${email.trim()}?subject=${subject}&body=${body}`;
  }

  completeBooking(): void {
    this.submittedAttempt.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.needsCustomQuote() || !this.formValid() || this.submitting()) {
      return;
    }

    const travelersCount = this.travelers() as 1 | 2 | 3 | 4 | 5;
    const primaryTraveler = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      nationality: this.country().trim(),
    };

    this.bookingState.setTravelDate(this.travelDate());
    this.bookingState.setPrimaryTraveler(primaryTraveler);
    this.submitting.set(true);

    this.bookingApi
      .submit({
        tourSlug: this.tour().slug,
        tourTitle: this.tour().title,
        tourDuration: this.tour().duration,
        travelersCount,
        travelDate: this.travelDate(),
        pricePerPerson: this.pricePerPerson(),
        totalPrice: this.totalPrice(),
        currency: this.tour().currency,
        primaryTraveler,
        locale: this.locale.activeLang(),
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.bookingRef.set(res.bookingRef);
          this.successMessage.set(
            res.message ||
              'Booking request received. Confirmation emails have been sent to you and our team.',
          );
          this.submittedAttempt.set(false);
          this.agreed.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          const apiMessage =
            typeof err.error?.message === 'string' ? err.error.message : null;
          const ref =
            typeof err.error?.bookingRef === 'string' ? err.error.bookingRef : '';
          if (ref) this.bookingRef.set(ref);
          this.errorMessage.set(
            apiMessage ||
              'Could not complete your booking right now. Please try WhatsApp or email us directly.',
          );
        },
      });
  }

  private buildInquiryMessage(): string {
    const parts = [
      `Hello Hai Sri Lanka — I'd like help planning "${this.tour().title}".`,
      this.needsCustomQuote()
        ? `Travelers: 6+ (please contact me to plan a custom group tour)`
        : `Travelers: ${this.travelers()}`,
      this.travelDate() ? `Date: ${this.travelDate()}` : null,
      this.firstName() || this.lastName()
        ? `Name: ${`${this.firstName()} ${this.lastName()}`.trim()}`
        : null,
      this.email() ? `Email: ${this.email()}` : null,
      this.phone() ? `Phone: ${this.phone()}` : null,
      this.needsCustomQuote()
        ? null
        : `Est. total: ${this.tour().currency} ${this.totalPrice()}`,
    ].filter(Boolean);
    return parts.join('\n');
  }
}
