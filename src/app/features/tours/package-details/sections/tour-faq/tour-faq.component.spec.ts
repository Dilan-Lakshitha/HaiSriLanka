import { TestBed } from '@angular/core/testing';
import { TourFaqComponent } from './tour-faq.component';

describe('TourFaqComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({ imports: [TourFaqComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TourFaqComponent);
    fixture.componentRef.setInput('items', []);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
