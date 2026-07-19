import { TestBed } from '@angular/core/testing';
import { TourOverviewComponent } from './tour-overview.component';
import type { Tour } from '../../../../../core/models';

describe('TourOverviewComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TourOverviewComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TourOverviewComponent);
    fixture.componentRef.setInput('tour', {
      description: 'd',
      duration: '1',
      location: { name: 'Galle' },
      rating: { average: 5, count: 1 },
    } as Tour);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
