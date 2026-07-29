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
import { Router } from '@angular/router';
import type { Tour } from '../../../../../core/models';
import { tourPriceMap } from '../../../../../core/models/tour.model';
import { BookingApiService } from '../../../../../core/services/booking-api.service';
import { BookingStateService } from '../../../../../core/services/booking-state.service';
import { CompanyService } from '../../../../../core/services/content.services';
import { LocaleService } from '../../../../../core/services/locale.service';
import { PricingService } from '../../../../../core/services/pricing.service';
import { UiButtonComponent } from '../../../../../shared/ui/button/ui-button.component';
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  formatInternationalPhone,
  type PhoneCountry,
} from '../../../../../core/constants/phone-countries';

/** 1–5 = priced group; 6 = 6+ travelers (custom quote) */
type TravelerOption = 1 | 2 | 3 | 4 | 5 | 6;

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
  private readonly router = inject(Router);

  readonly travelerOptions: TravelerOption[] = [1, 2, 3, 4, 5, 6];
  readonly phoneCountries = PHONE_COUNTRIES;
  readonly countries = PHONE_COUNTRIES.map((c) => c.name);

  readonly travelers = signal<TravelerOption>(2);
  readonly travelDate = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly dialCode = signal(DEFAULT_PHONE_COUNTRY.dial);
  readonly phoneNumber = signal('');
  readonly country = signal(DEFAULT_PHONE_COUNTRY.name);
  readonly agreed = signal(false);
  readonly submittedAttempt = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly fullPhone = computed(() =>
    formatInternationalPhone(this.dialCode(), this.phoneNumber()),
  );

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
    const nationalDigits = this.phoneNumber().replace(/\D/g, '');
    return (
      this.travelers() >= 1 &&
      Boolean(this.travelDate().trim()) &&
      Boolean(this.firstName().trim()) &&
      Boolean(this.lastName().trim()) &&
      Boolean(this.email().trim()) &&
      Boolean(this.dialCode().trim()) &&
      nationalDigits.length >= 6 &&
      Boolean(this.country().trim()) &&
      this.agreed()
    );
  });

  readonly company$ = this.company.getCompany();

  ngOnInit(): void {
    this.bookingState.selectTour(this.tour().slug, this.priceTable(), this.tour().currency);
  }

  dialOptionLabel(item: PhoneCountry): string {
    return `${item.dial} ${item.name}`;
  }

  onDialCodeChange(dial: string): void {
    this.dialCode.set(dial);
    const match = this.phoneCountries.find((c) => c.dial === dial);
    if (match && !this.country()) {
      this.country.set(match.name);
    }
  }

  onCountryChange(name: string): void {
    this.country.set(name);
    const match = this.phoneCountries.find((c) => c.name === name);
    if (match) {
      this.dialCode.set(match.dial);
    }
  }

  onPhoneNumberChange(value: string): void {
    // Keep digits and spaces only for national number part
    this.phoneNumber.set(value.replace(/[^\d\s]/g, ''));
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

    if (this.needsCustomQuote() || !this.formValid() || this.submitting()) {
      return;
    }

    const travelersCount = this.travelers() as 1 | 2 | 3 | 4 | 5;
    const phone = this.fullPhone();
    const primaryTraveler = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      phone,
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
          this.submittedAttempt.set(false);
          this.bookingState.setConfirmation({
            bookingRef: res.bookingRef,
            status: res.status,
            message:
              res.message ||
              'Booking request received. Confirmation emails have been sent to you and our team.',
            tourSlug: this.tour().slug,
            tourTitle: this.tour().title,
            tourDuration: this.tour().duration,
            travelersCount,
            travelDate: this.travelDate(),
            pricePerPerson: this.pricePerPerson(),
            totalPrice: this.totalPrice(),
            currency: this.tour().currency,
            primaryTraveler,
          });
          void this.router.navigate([
            '/',
            this.locale.activeLang(),
            'booking',
            this.tour().slug,
            'confirmation',
            res.bookingRef,
          ]);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          const apiMessage =
            typeof err.error?.message === 'string' ? err.error.message : null;
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
      this.fullPhone() ? `Phone: ${this.fullPhone()}` : null,
      this.needsCustomQuote()
        ? null
        : `Est. total: ${this.tour().currency} ${this.totalPrice()}`,
    ].filter(Boolean);
    return parts.join('\n');
  }
}
