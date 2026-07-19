import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import type { HomeSearch } from '../../../../core/models';
import { RevealDirective } from '../../../../core/directives/reveal.directive';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';
import { UiContainerComponent } from '../../../../shared/ui/container/ui-container.component';

@Component({
  selector: 'app-tour-search',
  standalone: true,
  imports: [FormsModule, RevealDirective, UiButtonComponent, UiContainerComponent],
  templateUrl: './tour-search.component.html',
  styleUrl: './tour-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourSearchComponent {
  private readonly router = inject(Router);

  readonly search = input.required<HomeSearch>();
  readonly lang = input.required<string>();

  readonly destination = signal('all');
  readonly duration = signal('all');
  readonly style = signal('all');

  onSubmit(event: Event): void {
    event.preventDefault();
    const duration = this.duration();
    const target =
      duration === 'day' ? 'day-tours' : duration === 'all' ? 'sri-lanka-tours' : 'multi-day-tours';
    void this.router.navigate(['/', this.lang(), target], {
      queryParams: {
        destination: this.destination(),
        duration: this.duration(),
        style: this.style(),
      },
    });
  }
}
