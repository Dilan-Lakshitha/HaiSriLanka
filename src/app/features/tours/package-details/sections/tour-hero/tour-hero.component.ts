import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Tour } from '../../../../../core/models';
import { tourPriceMap } from '../../../../../core/models/tour.model';
import { UiButtonComponent } from '../../../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../../../shared/ui/container/ui-container.component';

@Component({
  selector: 'app-tour-hero',
  standalone: true,
  imports: [CurrencyPipe, NgOptimizedImage, RouterLink, UiButtonComponent, UiContainerComponent],
  templateUrl: './tour-hero.component.html',
  styleUrl: './tour-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourHeroComponent {
  readonly tour = input.required<Tour>();
  readonly lang = input.required<string>();
  readonly galleryCount = input(0);
  readonly openGallery = output<void>();

  readonly fromPrice = computed(() => tourPriceMap(this.tour())['2']);
}
