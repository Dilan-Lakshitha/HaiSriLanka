import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { HomeSectionIntro, TourCategoryItem } from '../../../../core/models';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { trackById } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-tour-categories',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, UiContainerComponent],
  templateUrl: './tour-categories.component.html',
  styleUrl: './tour-categories.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourCategoriesComponent {
  readonly intro = input.required<HomeSectionIntro>();
  readonly items = input.required<TourCategoryItem[]>();
  readonly lang = input.required<string>();
  readonly trackById = trackById;
}
