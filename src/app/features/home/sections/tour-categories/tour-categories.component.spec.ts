import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TourCategoriesComponent } from './tour-categories.component';

describe('TourCategoriesComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourCategoriesComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourCategoriesComponent);
    fixture.componentRef.setInput('intro', { eyebrow: 'E', title: 'T', subtitle: 'S' });
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
