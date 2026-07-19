import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-section',
  standalone: true,
  templateUrl: './ui-section.component.html',
  styleUrl: './ui-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSectionComponent {
  readonly ariaLabelledby = input<string | undefined>(undefined);
}
