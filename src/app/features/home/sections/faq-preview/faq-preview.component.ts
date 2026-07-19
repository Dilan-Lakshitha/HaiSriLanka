import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { FaqItem, HomeSectionIntro } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-faq-preview',
  standalone: true,
  imports: [RouterLink, RevealDirective, UiContainerComponent, UiButtonComponent],
  templateUrl: './faq-preview.component.html',
  styleUrl: './faq-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPreviewComponent {
  readonly intro = input.required<HomeSectionIntro>();
  readonly items = input.required<FaqItem[]>();
  readonly lang = input.required<string>();
}
