import { TestBed } from '@angular/core/testing';
import { TourMobileBookBarComponent } from './tour-mobile-book-bar.component';
import type { Tour } from '../../../../../core/models';

describe('TourMobileBookBarComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [TourMobileBookBarComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(TourMobileBookBarComponent);
    fixture.componentRef.setInput('tour', {
      price: { '1': 1, '2': 95, '3': 3, '4': 4, '5': 5 },
      currency: 'USD',
    } as Tour);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
