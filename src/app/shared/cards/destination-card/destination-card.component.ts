import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Destination } from '../../../core/models';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './destination-card.component.html',
  styleUrl: './destination-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DestinationCardComponent {
  readonly destination = input.required<Destination>();
  readonly lang = input.required<string>();
}
