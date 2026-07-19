import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { BlogPost, HomeSectionIntro } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { BlogCardComponent } from '../../../../shared/cards/blog-card/blog-card.component';
import { trackBySlug } from '../../../../core/utils/track-by.util';

@Component({
  selector: 'app-blog-preview',
  standalone: true,
  imports: [
    RouterLink,
    RevealDirective,
    UiContainerComponent,
    UiButtonComponent,
    BlogCardComponent,
  ],
  templateUrl: './blog-preview.component.html',
  styleUrl: './blog-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPreviewComponent {
  readonly intro = input.required<HomeSectionIntro>();
  readonly posts = input.required<BlogPost[]>();
  readonly lang = input.required<string>();
  readonly trackBySlug = trackBySlug;
}
