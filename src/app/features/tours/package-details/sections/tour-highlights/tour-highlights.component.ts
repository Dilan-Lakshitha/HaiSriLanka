import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';

@Component({
  selector: 'app-tour-highlights',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './tour-highlights.component.html',
  styleUrl: './tour-highlights.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourHighlightsComponent {
  readonly highlights = input.required<string[]>();
}
