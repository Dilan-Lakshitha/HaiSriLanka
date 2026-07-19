import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Experience } from '../../../core/models';

@Component({
  selector: 'app-experience-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './experience-card.component.html',
  styleUrl: './experience-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceCardComponent {
  readonly experience = input.required<Experience>();
  readonly lang = input.required<string>();
}
