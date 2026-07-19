import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeSectionIntro, Review } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { ReviewCardComponent } from '../../../../shared/cards/review-card/review-card.component';
import { trackById } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-reviews-preview',
  standalone: true,
  imports: [
    RouterLink,
    RevealDirective,
    UiContainerComponent,
    UiButtonComponent,
    ReviewCardComponent,
  ],
  templateUrl: './reviews-preview.component.html',
  styleUrl: './reviews-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsPreviewComponent {
  readonly intro = input.required<HomeSectionIntro>();
  readonly reviews = input.required<Review[]>();
  readonly lang = input.required<string>();
  readonly trackById = trackById;
}
