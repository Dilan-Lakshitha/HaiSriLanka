import { TestBed } from '@angular/core/testing';
import { MapSectionComponent } from './map-section.component';

describe('MapSectionComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [MapSectionComponent] }).compileComponents();
    const fixture = TestBed.createComponent(MapSectionComponent);
    fixture.componentRef.setInput('map', {
      eyebrow: 'Map',
      title: 'Island',
      subtitle: 'Regions',
      image: {
        src: '/assets/images/placeholders/map-sri-lanka.svg',
        alt: 'Map',
        width: 900,
        height: 1100,
      },
      regions: [],
    });
    expect(fixture.componentInstance).toBeTruthy();
  });
});
