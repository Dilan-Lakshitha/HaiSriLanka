import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { HomeCta } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-home-cta',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    RevealDirective,
    UiContainerComponent,
    UiButtonComponent,
  ],
  templateUrl: './home-cta.component.html',
  styleUrl: './home-cta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeCtaComponent {
  readonly cta = input.required<HomeCta>();
  readonly lang = input.required<string>();
}
