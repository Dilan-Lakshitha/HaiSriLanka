import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Tour } from '../../../../core/models/tour.model';
import { tourHero, tourPriceMap } from '../../../../core/models/tour.model';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-tour-quick-view',
  standalone: true,
  imports: [CurrencyPipe, NgOptimizedImage, RouterLink, UiButtonComponent],
  templateUrl: './tour-quick-view.component.html',
  styleUrl: './tour-quick-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourQuickViewComponent {
  readonly tour = input.required<Tour>();
  readonly lang = input.required<string>();
  readonly detailPath = input.required<string>();
  readonly closed = output<void>();

  hero(): ReturnType<typeof tourHero> {
    return tourHero(this.tour());
  }

  fromPrice(): number {
    return tourPriceMap(this.tour())['2'];
  }
}
