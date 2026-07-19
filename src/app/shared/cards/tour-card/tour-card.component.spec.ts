import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TourCardComponent } from './tour-card.component';
import type { Tour } from '../../../core/models';

const tour = {
  id: '1',
  slug: 'galle-day-tour',
  category: 'day',
  title: 'Galle',
  seoTitle: 'Galle',
  metaDescription: 'Day',
  shortDescription: 'Day',
  overview: 'Desc',
  description: 'Desc',
  duration: '1 Day',
  destinations: ['Galle'],
  travelStyle: 'Culture',
  location: { name: 'Galle' },
  pricing: [{ travelers: 2, pricePerPerson: 1 }],
  price: { '1': 1, '2': 1, '3': 1, '4': 1, '5': 1 },
  currency: 'USD',
  heroImage: { src: '/assets/images/placeholders/tour-galle.svg', alt: 'Galle' },
  images: [{ src: '/assets/images/placeholders/tour-galle.svg', alt: 'Galle' }],
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
  badges: ['best-seller'],
  tags: [],
  route: [{ name: 'Galle' }],
  mapsUrl: 'https://maps.google.com',
  rating: { average: 5, count: 1 },
  seo: { metaTitle: 't', metaDescription: 'd', keywords: [] },
  status: 'published',
} as Tour;

describe('TourCardComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourCardComponent);
    fixture.componentRef.setInput('tour', tour);
    fixture.componentRef.setInput('lang', 'en');
    fixture.componentRef.setInput('detailPath', 'day-tour');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
