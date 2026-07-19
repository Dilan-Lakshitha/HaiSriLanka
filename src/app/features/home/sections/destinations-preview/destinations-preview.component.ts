import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Destination, HomeSectionIntro } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { DestinationCardComponent } from '../../../../shared/cards/destination-card/destination-card.component';
import { trackBySlug } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-destinations-preview',
  standalone: true,
  imports: [
    RouterLink,
    RevealDirective,
    UiContainerComponent,
    UiButtonComponent,
    DestinationCardComponent,
  ],
  templateUrl: './destinations-preview.component.html',
  styleUrl: './destinations-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestinationsPreviewComponent {
  readonly intro = input.required<HomeSectionIntro>();
  readonly destinations = input.required<Destination[]>();
  readonly lang = input.required<string>();
  readonly trackBySlug = trackBySlug;
}
