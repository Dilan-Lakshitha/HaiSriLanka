import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { Tour } from '../../../../../core/models';
import { tourPriceMap } from '../../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-mobile-book-bar',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './tour-mobile-book-bar.component.html',
  styleUrl: './tour-mobile-book-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourMobileBookBarComponent {
  readonly tour = input.required<Tour>();
  readonly fromPrice = computed(() => tourPriceMap(this.tour())['2']);
}
