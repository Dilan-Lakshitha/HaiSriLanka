import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'a[appUiButton], button[appUiButton]',
  standalone: true,
  templateUrl: './ui-button.component.html',
  styleUrl: './ui-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ui-button',
    '[class.ui-button--primary]': 'variant() === "primary"',
    '[class.ui-button--ghost]': 'variant() === "ghost"',
    '[class.ui-button--secondary]': 'variant() === "secondary"',
  },
})
export class UiButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost'>('primary');
}
