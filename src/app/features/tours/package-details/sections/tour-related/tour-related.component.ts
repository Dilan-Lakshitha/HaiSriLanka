import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Tour } from '../../../../../core/models';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../../shared/ui/container/ui-container.component';
import { TourCardComponent } from '../../../../../shared/cards/tour-card/tour-card.component';
import { trackBySlug } from '../../../../../core/utils/track-by.util';

@Component({
  selector: 'app-tour-related',
  standalone: true,
  imports: [RevealDirective, UiContainerComponent, TourCardComponent],
  templateUrl: './tour-related.component.html',
  styleUrl: './tour-related.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourRelatedComponent {
  readonly tours = input.required<Tour[]>();
  readonly lang = input.required<string>();
  readonly trackBySlug = trackBySlug;

  detailPath(tour: Tour): string {
    return tour.category === 'day' ? 'day-tour' : 'multi-day-tour';
  }
}
