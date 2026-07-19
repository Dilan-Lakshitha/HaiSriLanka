import { TestBed } from '@angular/core/testing';
import { TourReviewsComponent } from './tour-reviews.component';

describe('TourReviewsComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TourReviewsComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TourReviewsComponent);
    fixture.componentRef.setInput('reviews', []);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
