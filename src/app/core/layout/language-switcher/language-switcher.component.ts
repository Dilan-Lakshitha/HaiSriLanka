import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { LocaleService } from '../../services/locale.service';
import { TranslocoPipe } from '@jsverse/transloco';
import type { LocaleDefinition } from '../../models';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  private readonly locale = inject(LocaleService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly currentLang = input.required<string>();

  readonly locales = this.locale.enabledLocales;
  readonly open = signal(false);

  readonly activeLocale = computed(() => {
    const code = this.currentLang();
    return this.locales().find((l) => l.code === code) ?? this.locales()[0];
  });

  flagSrc(loc: LocaleDefinition | undefined): string {
    const code = loc?.flagCode || loc?.code || 'gb';
    return `/assets/images/flags/${code}.svg`;
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  select(code: string): void {
    this.open.set(false);
    if (code !== this.currentLang()) {
      void this.locale.switchLanguage(code);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
