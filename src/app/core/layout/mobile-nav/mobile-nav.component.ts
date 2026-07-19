import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import type { NavItem } from '../../models';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [RouterLink, TranslocoPipe],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavComponent {
  readonly items = input.required<NavItem[]>();
  readonly lang = input.required<string>();
  readonly open = signal(false);

  readonly closed = output<void>();

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  buildLink(path: string): string[] {
    return path ? ['/', this.lang(), path] : ['/', this.lang()];
  }
}
