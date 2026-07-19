import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-skeleton',
  standalone: true,
  templateUrl: './ui-skeleton.component.html',
  styleUrl: './ui-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSkeletonComponent {
  readonly height = input('1rem');
  readonly width = input('100%');
}
