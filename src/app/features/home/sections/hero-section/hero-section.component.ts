import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { timer, switchMap, interval } from 'rxjs';
import { TranslocoPipe } from '@jsverse/transloco';
import type { HomeHero, ImageAsset } from '../../../../core/models';
import { UiButtonComponent } from '../../../../shared/ui/button/ui-button.component';

const LCP_SHELL_ID = 'hsl-lcp-hero';
const LCP_SHELL_IMG_ID = 'hsl-lcp-hero-img';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, TranslocoPipe],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly media = viewChild<ElementRef<HTMLElement>>('heroMedia');

  readonly hero = input.required<HomeHero>();
  readonly lang = input.required<string>();

  readonly activeIndex = signal(0);
  readonly paused = signal(false);

  /**
   * When true, slide 0 is the adopted index.html <img> (same DOM node as early LCP).
   * Do not mount a second copy — that caused a blank/veil-only hero.
   */
  private readonly adoptedLcp = signal(false);

  readonly slides = computed<ImageAsset[]>(() => {
    const hero = this.hero();
    return hero.images?.length ? hero.images : [hero.image];
  });

  readonly slideCount = computed(() => this.slides().length);
  readonly showControls = computed(() => this.slideCount() > 1);

  /** Active + next only. Skip Angular slide 0 while adopted LCP <img> owns it. */
  readonly renderedSlides = computed(() => {
    const all = this.slides();
    const i = this.activeIndex();
    if (all.length === 0) {
      return [] as Array<ImageAsset & { index: number }>;
    }
    const indices = new Set<number>();
    if (!(this.adoptedLcp() && i === 0)) {
      indices.add(i);
    }
    if (all.length > 1) {
      indices.add((i + 1) % all.length);
    }
    return [...indices].map((index) => ({ ...all[index], index }));
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanupShellClasses());

    effect(() => {
      if (!this.isBrowser || !this.adoptedLcp()) {
        return;
      }
      const onZero = this.activeIndex() === 0;
      const adopted = document.querySelector<HTMLImageElement>('img.hero__img--lcp');
      if (adopted) {
        adopted.classList.toggle('is-active', onZero);
        adopted.style.opacity = onZero ? '1' : '0';
      }
      document.documentElement.classList.toggle('hsl-hero-carousel', !onZero);
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

  ngAfterViewInit(): void {
    this.adoptLcpShellImage();
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

  /** Move the first-HTML LCP <img> into the hero so it stays visible and sharp. */
  private adoptLcpShellImage(): void {
    if (!this.isBrowser) {
      return;
    }
    const media = this.media()?.nativeElement;
    const shellImg = document.getElementById(LCP_SHELL_IMG_ID) as HTMLImageElement | null;
    const shell = document.getElementById(LCP_SHELL_ID);
    const first = this.slides()[0];
    if (!media || !shellImg || !first) {
      shell?.remove();
      document.documentElement.classList.remove('hsl-home');
      return;
    }

    shellImg.id = '';
    shellImg.className = 'hero__img hero__img--lcp is-active';
    // Moved nodes are outside Angular emulated encapsulation — set layout inline.
    shellImg.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:1;pointer-events:none;';
    shellImg.alt = first.alt || '';
    if (first.title) {
      shellImg.title = first.title;
    }
    shellImg.setAttribute('width', String(first.width || 1920));
    shellImg.setAttribute('height', String(first.height || 1080));
    shellImg.fetchPriority = 'high';
    media.insertBefore(shellImg, media.firstChild);
    shell?.remove();
    document.documentElement.classList.remove('hsl-home');
    this.adoptedLcp.set(true);
  }

  private cleanupShellClasses(): void {
    if (!this.isBrowser) {
      return;
    }
    document.documentElement.classList.remove('hsl-hero-carousel', 'hsl-home');
    document.getElementById(LCP_SHELL_ID)?.remove();
  }
}
