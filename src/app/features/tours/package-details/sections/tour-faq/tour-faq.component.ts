import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { FaqItem } from '../../../../../core/models';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';

@Component({
  selector: 'app-tour-faq',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './tour-faq.component.html',
  styleUrl: './tour-faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourFaqComponent {
  readonly items = input.required<FaqItem[]>();
}
