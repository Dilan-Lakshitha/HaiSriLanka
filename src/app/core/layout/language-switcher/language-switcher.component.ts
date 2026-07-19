import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LocaleService } from '../../services/locale.service';
import { TranslocoPipe } from '@jsverse/transloco';

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

  readonly currentLang = input.required<string>();

  readonly locales = this.locale.enabledLocales;

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    void this.locale.switchLanguage(select.value);
  }
}
