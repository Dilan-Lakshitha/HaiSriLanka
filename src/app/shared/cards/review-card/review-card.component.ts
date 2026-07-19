import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Review } from '../../../core/models';

@Component({
  selector: 'app-review-card',
  standalone: true,
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardComponent {
  readonly review = input.required<Review>();
}
