import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-container',
  standalone: true,
  templateUrl: './ui-container.component.html',
  styleUrl: './ui-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiContainerComponent {
  readonly narrow = input(false);
}
