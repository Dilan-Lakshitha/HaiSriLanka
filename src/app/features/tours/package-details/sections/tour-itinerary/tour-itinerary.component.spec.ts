import { TestBed } from '@angular/core/testing';
import { TourItineraryComponent } from './tour-itinerary.component';

describe('TourItineraryComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TourItineraryComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TourItineraryComponent);
    fixture.componentRef.setInput('days', [
      {
        day: 1,
        title: 'Galle',
        description: 'Coast day',
        locations: ['Galle Fort'],
        travelTime: '3 hrs',
        meals: ['Lunch'],
        highlights: ['Ramparts'],
        images: [{ src: '/assets/images/destinations/galle.webp', alt: 'Galle' }],
      },
    ]);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
