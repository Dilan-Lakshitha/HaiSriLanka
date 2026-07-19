import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import type { ItineraryDay } from '../../../../../core/models/tour.model';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';

@Component({
  selector: 'app-tour-itinerary',
  standalone: true,
  imports: [NgOptimizedImage, RevealDirective],
  templateUrl: './tour-itinerary.component.html',
  styleUrl: './tour-itinerary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourItineraryComponent {
  readonly days = input.required<ItineraryDay[]>();
  readonly expandedDay = signal<number | null>(null);

  toggle(day: number): void {
    this.expandedDay.update((current) => (current === day ? null : day));
  }

  isExpanded(day: number): boolean {
    return this.expandedDay() === day;
  }

  locationsLabel(day: ItineraryDay): string {
    if (day.locations?.length) {
      return day.locations.join(' · ');
    }
    return day.location?.name ?? '';
  }
}
