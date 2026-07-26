import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import type { Tour } from '../../../core/models';
import {
  tourHasBadge,
  tourHero,
  tourPriceMap,
  type TourBadge,
} from '../../../core/models/tour.model';
import { UiBadgeComponent } from '../../ui/badge/ui-badge.component';
import { CompareService } from '../../../core/services/compare.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, CurrencyPipe, UiBadgeComponent, TranslocoPipe],
  templateUrl: './tour-card.component.html',
  styleUrl: './tour-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourCardComponent {
  readonly tour = input.required<Tour>();
  readonly lang = input.required<string>();
  readonly detailPath = input.required<string>();
  readonly layout = input<'grid' | 'list'>('grid');

  readonly quickView = output<Tour>();

  private readonly compare = inject(CompareService);
  private readonly wishlist = inject(WishlistService);

  readonly hero = computed(() => tourHero(this.tour()));
  readonly fromPrice = computed(() => tourPriceMap(this.tour())['2']);
  readonly badgeKeys = computed(() => {
    const tour = this.tour();
    const order: TourBadge[] = [
      'best-seller',
      'featured',
      'luxury',
      'family',
      'adventure',
      'wildlife',
      'culture',
    ];
    return order.filter((b) => tourHasBadge(tour, b));
  });

  readonly styleKey = computed(() => {
    const raw = (this.tour().travelStyle || '').trim().toLowerCase();
    const map: Record<string, string> = {
      culture: 'culture',
      wildlife: 'wildlife',
      adventure: 'adventure',
      luxury: 'luxury',
      family: 'family',
      'private day journey': 'privateDay',
      'private multi-day journey': 'privateMulti',
      'beach & coast': 'beach',
      'culture & heritage': 'culture',
      'luxury & wellness': 'luxury',
    };
    return map[raw] || '';
  });

  isCompared(): boolean {
    return this.compare.has(this.tour().slug);
  }

  isWishlisted(): boolean {
    return this.wishlist.has(this.tour().slug);
  }

  toggleCompare(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.compare.toggle(this.tour().slug);
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(this.tour().slug);
  }

  onQuickView(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.quickView.emit(this.tour());
  }
}
