import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TravelStat } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { trackById } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-travel-stats',
  standalone: true,
  imports: [RevealDirective, UiContainerComponent],
  templateUrl: './travel-stats.component.html',
  styleUrl: './travel-stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TravelStatsComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly items = input.required<TravelStat[]>();
  readonly trackById = trackById;
}
