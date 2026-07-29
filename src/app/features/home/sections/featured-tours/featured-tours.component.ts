import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { HomeSectionIntro, Tour } from '../../../../core/models';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { TourCardComponent } from '../../../../shared/cards/tour-card/tour-card.component';
import { trackBySlug } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-featured-tours',
  standalone: true,
  imports: [
    RouterLink,
    UiContainerComponent,
    UiButtonComponent,
    TourCardComponent,
  ],
  templateUrl: './featured-tours.component.html',
  styleUrl: './featured-tours.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedToursComponent {
  readonly intro = input.required<HomeSectionIntro>();
  readonly tours = input.required<Tour[]>();
  readonly lang = input.required<string>();
  readonly detailPath = input.required<string>();
  readonly trackBySlug = trackBySlug;
  readonly skeletonSlots = [0, 1, 2];
}
