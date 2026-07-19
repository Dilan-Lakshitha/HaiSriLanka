import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-heading',
  standalone: true,
  templateUrl: './ui-heading.component.html',
  styleUrl: './ui-heading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiHeadingComponent {
  readonly level = input<1 | 2 | 3>(2);
  readonly eyebrow = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
}
