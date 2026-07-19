import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-skip-link',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './skip-link.component.html',
  styleUrl: './skip-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkipLinkComponent {}
