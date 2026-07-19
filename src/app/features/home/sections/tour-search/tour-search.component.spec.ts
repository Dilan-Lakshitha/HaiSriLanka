import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TourSearchComponent } from './tour-search.component';
import type { HomeSearch } from '../../../../core/models';

const search: HomeSearch = {
  title: 'Find',
  subtitle: 'Search',
  destinationLabel: 'Destination',
  durationLabel: 'Duration',
  styleLabel: 'Style',
  submitLabel: 'Search',
  destinations: [{ value: 'all', label: 'All' }],
  durations: [{ value: 'all', label: 'All' }],
  styles: [{ value: 'all', label: 'All' }],
};

describe('TourSearchComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourSearchComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourSearchComponent);
    fixture.componentRef.setInput('search', search);
    fixture.componentRef.setInput('lang', 'en');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
