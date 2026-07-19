import { TestBed } from '@angular/core/testing';
import { TourHighlightsComponent } from './tour-highlights.component';

describe('TourHighlightsComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TourHighlightsComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TourHighlightsComponent);
    fixture.componentRef.setInput('highlights', ['A']);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
