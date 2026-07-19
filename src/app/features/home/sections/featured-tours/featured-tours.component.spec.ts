import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FeaturedToursComponent } from './featured-tours.component';

describe('FeaturedToursComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedToursComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(FeaturedToursComponent);
    fixture.componentRef.setInput('intro', { eyebrow: 'E', title: 'T', subtitle: 'S' });
    fixture.componentRef.setInput('tours', []);
    fixture.componentRef.setInput('lang', 'en');
    fixture.componentRef.setInput('detailPath', 'day-tour');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
