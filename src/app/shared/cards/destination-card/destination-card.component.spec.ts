import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DestinationCardComponent } from './destination-card.component';
import type { Destination } from '../../../core/models';

const destination = {
  id: '1',
  slug: 'galle',
  title: 'Galle',
  shortDescription: 'Fort',
  description: 'Desc',
  region: 'South',
  images: [{ src: '/assets/images/placeholders/dest-galle.svg', alt: 'Galle' }],
  relatedTourSlugs: [],
  seo: { metaTitle: 't', metaDescription: 'd', keywords: [] },
  status: 'published',
} as Destination;

describe('DestinationCardComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(DestinationCardComponent);
    fixture.componentRef.setInput('destination', destination);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
