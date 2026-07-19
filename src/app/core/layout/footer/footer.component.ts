import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LocaleService } from '../../services/locale.service';
import { CompanyService, NavigationService } from '../../services/content.services';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [AsyncPipe, NgOptimizedImage, RouterLink, TranslocoPipe],
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

  buildLink(path: string): string[] {
    return path ? ['/', this.locale.activeLang(), path] : ['/', this.locale.activeLang()];
  }
}
