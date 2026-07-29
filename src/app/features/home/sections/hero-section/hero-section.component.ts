import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
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

const LCP_SHELL_ID = 'hsl-lcp-hero';

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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly hero = input.required<HomeHero>();
  readonly lang = input.required<string>();

  readonly activeIndex = signal(0);
  readonly paused = signal(false);

  /** True while the static index.html LCP shell covers slide 0. */
  private readonly useLcpShell = signal(
    this.isBrowser && !!document.getElementById(LCP_SHELL_ID),
  );

  readonly slides = computed<ImageAsset[]>(() => {
    const hero = this.hero();
    return hero.images?.length ? hero.images : [hero.image];
  });

  readonly slideCount = computed(() => this.slides().length);
  readonly showControls = computed(() => this.slideCount() > 1);

  /**
   * Keep active + next in the DOM. When the static LCP shell is showing slide 0,
   * skip mounting a second copy of that image so PSI does not re-attribute LCP
   * to a late Angular <img> (~2s element render delay).
   */
  readonly renderedSlides = computed(() => {
    const all = this.slides();
    const i = this.activeIndex();
    if (all.length === 0) {
      return [] as Array<ImageAsset & { index: number }>;
    }
    if (all.length === 1) {
      if (this.useLcpShell() && i === 0) {
        return [];
      }
      return [{ ...all[0], index: 0 }];
    }
    const next = (i + 1) % all.length;
    const out: Array<ImageAsset & { index: number }> = [];
    if (!(this.useLcpShell() && i === 0)) {
      out.push({ ...all[i], index: i });
    }
    if (next !== i) {
      out.push({ ...all[next], index: next });
    }
    return out;
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.teardownLcpShell());

    effect(() => {
      if (!this.isBrowser || !this.useLcpShell()) {
        return;
      }
      const onSlideZero = this.activeIndex() === 0;
      const shell = document.getElementById(LCP_SHELL_ID);
      if (!shell) {
        this.useLcpShell.set(false);
        document.documentElement.classList.remove('hsl-hero-carousel');
        return;
      }
      shell.hidden = !onSlideZero;
      document.documentElement.classList.toggle('hsl-hero-carousel', !onSlideZero);
    });

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

  private teardownLcpShell(): void {
    if (!this.isBrowser) {
      return;
    }
    document.documentElement.classList.remove('hsl-hero-carousel', 'hsl-home');
    document.getElementById(LCP_SHELL_ID)?.remove();
    this.useLcpShell.set(false);
  }
}
