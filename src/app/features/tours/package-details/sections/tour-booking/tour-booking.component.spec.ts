import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TourBookingComponent } from './tour-booking.component';
import type { Tour } from '../../../../../core/models';

const tour = {
  id: 't1',
  slug: 'galle-day-tour',
  category: 'day',
  title: 'Galle Day Tour',
  seoTitle: 'Galle',
  metaDescription: 'Tour',
  shortDescription: 'Coast',
  overview: 'Full day',
  description: 'Full day',
  duration: '1 day',
  destinations: ['Galle'],
  travelStyle: 'Culture',
  location: { name: 'Galle' },
  pricing: [
    { travelers: 1, pricePerPerson: 180 },
    { travelers: 2, pricePerPerson: 95 },
    { travelers: 3, pricePerPerson: 80 },
    { travelers: 4, pricePerPerson: 70 },
    { travelers: 5, pricePerPerson: 65 },
  ],
  price: { '1': 180, '2': 95, '3': 80, '4': 70, '5': 65 },
  currency: 'USD',
  heroImage: { src: '/x.webp', alt: 'x' },
  images: [],
  gallery: [],
  highlights: [],
  included: [],
  excluded: [],
  includes: [],
  excludes: [],
  itinerary: [],
  faqs: [],
  faq: [],
  relatedTours: [],
  badges: [],
  tags: [],
  route: [{ name: 'Galle' }],
  mapsUrl: 'https://maps.google.com',
  rating: { average: 5, count: 1 },
  seo: { metaTitle: 'Galle', metaDescription: 'Tour', keywords: [] },
  status: 'published',
} as Tour;

describe('TourBookingComponent', () => {
  it('should create and price instantly', async () => {
    await TestBed.configureTestingModule({
      imports: [TourBookingComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourBookingComponent);
    fixture.componentRef.setInput('tour', tour);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.totalPrice()).toBe(190);
  });
});
