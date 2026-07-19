import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Review } from '../../../../../core/models';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';
import { ReviewCardComponent } from '../../../../../shared/cards/review-card/review-card.component';
import { trackById } from '../../../../../core/utils/track-by.util';

@Component({
  selector: 'app-tour-reviews',
  standalone: true,
  imports: [RevealDirective, ReviewCardComponent],
  templateUrl: './tour-reviews.component.html',
  styleUrl: './tour-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourReviewsComponent {
  readonly reviews = input.required<Review[]>();
  readonly trackById = trackById;

  sourceLabel(source: Review['source']): string {
    switch (source) {
      case 'tripadvisor':
        return 'TripAdvisor';
      case 'google':
        return 'Google';
      case 'internal':
      case 'site':
        return 'Hai Sri Lanka';
      default:
        return String(source);
    }
  }
}
