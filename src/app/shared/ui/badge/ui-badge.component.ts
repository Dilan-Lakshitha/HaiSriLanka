import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  templateUrl: './ui-badge.component.html',
  styleUrl: './ui-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBadgeComponent {
  readonly tone = input<'neutral' | 'accent'>('neutral');
}
