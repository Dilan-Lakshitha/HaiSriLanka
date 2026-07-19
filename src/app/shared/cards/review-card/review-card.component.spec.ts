import { TestBed } from '@angular/core/testing';
import { ReviewCardComponent } from './review-card.component';
import type { Review } from '../../../core/models';

const review = {
  id: '1',
  author: 'A',
  rating: 5,
  title: 'Great',
  content: 'Loved it',
  date: '2026-01-01',
  source: 'google',
} as Review;

describe('ReviewCardComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [ReviewCardComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ReviewCardComponent);
    fixture.componentRef.setInput('review', review);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
