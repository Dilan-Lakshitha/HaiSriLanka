import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Tour } from '../../../../../core/models';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';

export type OverviewMode = 'story' | 'facts' | 'full';

@Component({
  selector: 'app-tour-overview',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './tour-overview.component.html',
  styleUrl: './tour-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourOverviewComponent {
  readonly tour = input.required<Tour>();
  /** story = copy only; facts = duration/destinations/style; full = both */
  readonly mode = input<OverviewMode>('full');
}
