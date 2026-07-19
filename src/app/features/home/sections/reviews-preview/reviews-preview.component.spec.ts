import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReviewsPreviewComponent } from './reviews-preview.component';

describe('ReviewsPreviewComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewsPreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ReviewsPreviewComponent);
    fixture.componentRef.setInput('intro', { eyebrow: 'E', title: 'T', subtitle: 'S' });
    fixture.componentRef.setInput('reviews', []);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
