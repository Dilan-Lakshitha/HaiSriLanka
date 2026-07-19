import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TourListPageComponent } from './tour-list-page.component';

describe('TourListPageComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourListPageComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourListPageComponent);
    fixture.componentRef.setInput('category', 'day');
    expect(fixture.componentInstance).toBeTruthy();
  });
});
