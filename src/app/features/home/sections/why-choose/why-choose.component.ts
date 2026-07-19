import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { HomeSectionIntro, WhyChooseItem } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { trackById } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-why-choose',
  standalone: true,
  imports: [RevealDirective, UiContainerComponent],
  templateUrl: './why-choose.component.html',
  styleUrl: './why-choose.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhyChooseComponent {
  readonly intro = input.required<HomeSectionIntro>();
  readonly items = input.required<WhyChooseItem[]>();
  readonly trackById = trackById;
}
