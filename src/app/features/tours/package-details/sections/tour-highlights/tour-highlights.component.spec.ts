import { TestBed } from '@angular/core/testing';
import { TourHighlightsComponent } from './tour-highlights.component';

describe('TourHighlightsComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TourHighlightsComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TourHighlightsComponent);
    fixture.componentRef.setInput('highlights', [
      { title: 'Nine Arch Bridge', description: 'Photo stop above the tea country.' },
    ]);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
