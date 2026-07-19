import { TestBed } from '@angular/core/testing';
import { TravelStatsComponent } from './travel-stats.component';

describe('TravelStatsComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TravelStatsComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TravelStatsComponent);
    fixture.componentRef.setInput('eyebrow', 'By numbers');
    fixture.componentRef.setInput('title', 'Stats');
    fixture.componentRef.setInput('items', []);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
