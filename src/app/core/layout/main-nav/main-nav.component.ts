import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { NavItem } from '../../models';

@Component({
  selector: 'app-main-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-nav.component.html',
  styleUrl: './main-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {
  readonly items = input.required<NavItem[]>();
  readonly lang = input.required<string>();
  readonly navigated = output<void>();

  readonly openMega = signal<string | null>(null);

  buildLink(path: string): string[] {
    return path ? ['/', this.lang(), path] : ['/', this.lang()];
  }

  labelOf(item: NavItem): string {
    return item.label ?? item.key;
  }

  open(key: string): void {
    this.openMega.set(key);
  }

  close(): void {
    this.openMega.set(null);
  }

  onNavigated(): void {
    this.close();
    this.navigated.emit();
  }
}
