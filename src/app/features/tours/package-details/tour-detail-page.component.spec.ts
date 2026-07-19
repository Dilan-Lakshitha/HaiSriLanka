import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TourDetailPageComponent } from './tour-detail-page.component';

describe('TourDetailPageComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourDetailPageComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourDetailPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
