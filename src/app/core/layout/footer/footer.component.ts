import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LocaleService } from '../../services/locale.service';
import { CompanyService, NavigationService } from '../../services/content.services';
import { UiButtonComponent } from '../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    FormsModule,
    RouterLink,
    TranslocoPipe,
    UiButtonComponent,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private readonly navigation = inject(NavigationService);
  private readonly companyService = inject(CompanyService);
  readonly locale = inject(LocaleService);

  readonly year = new Date().getFullYear();
  readonly nav$ = this.navigation.getNavigation();
  readonly company$ = this.companyService.getCompany();
  readonly email = signal('');
  readonly subscribed = signal(false);

  buildLink(path: string): string[] {
    return path ? ['/', this.locale.activeLang(), path] : ['/', this.locale.activeLang()];
  }

  onSubscribe(event: Event): void {
    event.preventDefault();
    if (!this.email().trim()) {
      return;
    }
    this.subscribed.set(true);
    this.email.set('');
  }
}
