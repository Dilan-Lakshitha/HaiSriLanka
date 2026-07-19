import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';

@Component({
  selector: 'app-tour-includes',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './tour-includes.component.html',
  styleUrl: './tour-includes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourIncludesComponent {
  readonly includes = input.required<string[]>();
  readonly excludes = input.required<string[]>();
}
