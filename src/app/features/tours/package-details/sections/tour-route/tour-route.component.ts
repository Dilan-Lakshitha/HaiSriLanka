import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { TourRouteStop } from '../../../../../core/models/tour.model';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';

@Component({
  selector: 'app-tour-route',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './tour-route.component.html',
  styleUrl: './tour-route.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourRouteComponent {
  readonly stops = input.required<TourRouteStop[]>();
  readonly mapsUrl = input.required<string>();
}
