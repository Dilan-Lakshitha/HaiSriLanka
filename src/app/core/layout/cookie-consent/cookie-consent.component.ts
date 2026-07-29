import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ConsentService } from '../../services/consent.service';
import { LocaleService } from '../../services/locale.service';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, UiButtonComponent],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsentComponent {
  readonly consent = inject(ConsentService);
  readonly locale = inject(LocaleService);

  acceptAll(): void {
    this.consent.acceptAll();
  }

  acceptEssential(): void {
    this.consent.acceptEssential();
  }
}
