import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { BlogPost } from '../../../core/models';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, DatePipe],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogCardComponent {
  readonly post = input.required<BlogPost>();
  readonly lang = input.required<string>();
}
