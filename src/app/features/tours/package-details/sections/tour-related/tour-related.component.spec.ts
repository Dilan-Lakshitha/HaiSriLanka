import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TourRelatedComponent } from './tour-related.component';

describe('TourRelatedComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourRelatedComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourRelatedComponent);
    fixture.componentRef.setInput('tours', []);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
