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

  /** Active slide only. Do not mount the "next" slide in-DOM — opacity:0 images
   *  still load when in the viewport (PSI downloaded safari while slide 0 was showing). */
  readonly renderedSlides = computed(() => {
    const all = this.slides();
    const i = this.activeIndex();
    if (all.length === 0) {
      return [] as Array<ImageAsset & { index: number }>;
    }
    if (this.adoptedLcp() && i === 0) {
      return [];
    }
    return [{ ...all[i], index: i }];
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanupShellClasses());

    effect(() => {
      if (!this.isBrowser || !this.adoptedLcp()) {
        return;
      }
      const onZero = this.activeIndex() === 0;
      const adopted = document.querySelector<HTMLImageElement>('img.hero__img--lcp');
      const picture = adopted?.closest('picture') as HTMLElement | null;
      if (adopted) {
        adopted.classList.toggle('is-active', onZero);
        adopted.style.opacity = onZero ? '1' : '0';
      }
      if (picture) {
        picture.style.opacity = onZero ? '1' : '0';
      }
      document.documentElement.classList.toggle('hsl-hero-carousel', !onZero);
    });

    // Delay autoplay so Lighthouse / LCP settle on the first slide (lab often runs ~5–10s).
    timer(12000)
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

  /** Move the first-HTML LCP <picture>/<img> into the hero so it stays visible. */
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

    const node: HTMLElement =
      (document.getElementById('hsl-lcp-picture') as HTMLElement | null) || shellImg;

    shellImg.id = '';
    shellImg.className = 'hero__img hero__img--lcp is-active';
    // Moved nodes are outside Angular emulated encapsulation — set layout inline.
    const fill =
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:1;pointer-events:none;';
    shellImg.style.cssText = fill;
    if (node !== shellImg) {
      node.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;margin:0;display:block;pointer-events:none;';
    }
    shellImg.alt = first.alt || '';
    if (first.title) {
      shellImg.title = first.title;
    }
    shellImg.setAttribute('width', String(first.width || 1280));
    shellImg.setAttribute('height', String(first.height || 720));
    shellImg.fetchPriority = 'high';
    media.insertBefore(node, media.firstChild);
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
