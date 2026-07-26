import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { timer, switchMap, interval } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import type { HomeHero, ImageAsset } from '../../../../core/models';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, TranslocoPipe],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly hero = input.required<HomeHero>();
  readonly lang = input.required<string>();

  readonly activeIndex = signal(0);
  readonly paused = signal(false);

  readonly slides = computed<ImageAsset[]>(() => {
    const hero = this.hero();
    return hero.images?.length ? hero.images : [hero.image];
  });

  readonly slideCount = computed(() => this.slides().length);
  readonly showControls = computed(() => this.slideCount() > 1);

  /** Only keep active + next in the DOM to protect LCP bandwidth. */
  readonly renderedSlides = computed(() => {
    const all = this.slides();
    const i = this.activeIndex();
    if (all.length === 0) {
      return [] as Array<ImageAsset & { index: number }>;
    }
    if (all.length === 1) {
      return [{ ...all[0], index: 0 }];
    }
    const next = (i + 1) % all.length;
    return [
      { ...all[i], index: i },
      { ...all[next], index: next },
    ];
  });

  constructor() {
    // Delay autoplay so Lighthouse / LCP can settle on the first slide.
    timer(6000)
      .pipe(
        switchMap(() => interval(4500)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.paused() || this.slideCount() < 2) {
          return;
        }
        this.next();
      });
  }

  goTo(index: number): void {
    const count = this.slideCount();
    if (count < 1) {
      return;
    }
    this.activeIndex.set(((index % count) + count) % count);
  }

  next(): void {
    this.goTo(this.activeIndex() + 1);
  }

  prev(): void {
    this.goTo(this.activeIndex() - 1);
  }

  pause(): void {
    this.paused.set(true);
  }

  resume(): void {
    this.paused.set(false);
  }
}
