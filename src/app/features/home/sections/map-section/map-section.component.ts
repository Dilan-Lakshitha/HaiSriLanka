import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import type { HomeMapSection } from '../../../../core/models/home.model';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { trackById } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-map-section',
  standalone: true,
  imports: [NgOptimizedImage, RevealDirective, UiContainerComponent],
  templateUrl: './map-section.component.html',
  styleUrl: './map-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapSectionComponent {
  readonly map = input.required<HomeMapSection>();
  readonly trackById = trackById;
}
