import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import type { NavItem } from '../../models';
import { CompanyService } from '../../services/content.services';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [AsyncPipe, RouterLink, TranslocoPipe],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileNavComponent {
  private readonly companyService = inject(CompanyService);

  readonly items = input.required<NavItem[]>();
  readonly lang = input.required<string>();
  readonly open = signal(false);
  readonly closed = output<void>();

  readonly company$ = this.companyService.getCompany();

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

  telLink(phone: string): string {
    return `tel:${phone.replace(/\s+/g, '')}`;
  }

  whatsappLink(phone: string): string {
    return `https://wa.me/${phone.replace(/\D/g, '')}`;
  }
}
