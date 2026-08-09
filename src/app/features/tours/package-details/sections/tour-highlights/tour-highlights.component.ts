import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';
import {
  highlightDescription,
  highlightTitle,
  type TourHighlightItem,
} from '../../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-highlights',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './tour-highlights.component.html',
  styleUrl: './tour-highlights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourHighlightsComponent {
  readonly highlights = input.required<TourHighlightItem[]>();

  titleOf(item: TourHighlightItem): string {
    return highlightTitle(item);
  }

  detailOf(item: TourHighlightItem): string {
    return highlightDescription(item);
  }
}
