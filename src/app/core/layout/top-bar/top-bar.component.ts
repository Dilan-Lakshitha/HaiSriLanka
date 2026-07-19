import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CompanyService } from '../../services/content.services';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  private readonly companyService = inject(CompanyService);
  readonly company$ = this.companyService.getCompany();

  whatsappLink(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  }

  telLink(phone: string): string {
    return `tel:${phone.replace(/\s+/g, '')}`;
  }
}
