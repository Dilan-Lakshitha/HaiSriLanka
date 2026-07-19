import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TourHeroComponent } from './tour-hero.component';
import type { Tour } from '../../../../../core/models';

const tour = {
  id: '1',
  slug: 'galle-day-tour',
  category: 'day',
  title: 'Galle',
  shortDescription: 'Day',
  description: 'Desc',
  duration: '1 Day',
  location: { name: 'Galle' },
  price: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
  currency: 'USD',
  images: [{ src: '/assets/images/tours/galle-day-tour.webp', alt: 'Galle', width: 1400, height: 1050 }],
  itinerary: [],
  includes: [],
  excludes: [],
  rating: { average: 5, count: 1 },
  faq: [],
  seo: { metaTitle: 't', metaDescription: 'd', keywords: [] },
  status: 'published',
} as Tour;

describe('TourHeroComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourHeroComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourHeroComponent);
    fixture.componentRef.setInput('tour', tour);
    fixture.componentRef.setInput('lang', 'en');
    fixture.componentRef.setInput('galleryCount', 3);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
