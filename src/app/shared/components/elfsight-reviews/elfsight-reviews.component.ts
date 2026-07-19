import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewEncapsulation,
  afterNextRender,
  inject,
} from '@angular/core';

const ELFSIGHT_SCRIPT_ID = 'elfsight-platform-js';
const ELFSIGHT_SCRIPT_SRC = 'https://elfsightcdn.com/platform.js';
const ELFSIGHT_APP_CLASS = 'elfsight-app-037e85fa-163c-4ad7-935b-4d02da891156';

/**
 * Elfsight All-in-One Reviews.
 * Uses ngSkipHydration so Angular SSR hydration does not wipe the widget DOM.
 * Loads platform.js once and mounts a fresh widget node in the browser.
 */
@Component({
  selector: 'app-elfsight-reviews',
  standalone: true,
  // Third-party script mutates this subtree — skip Angular hydration.
  host: {
    ngSkipHydration: 'true',
    class: 'elfsight-reviews-host',
  },
  template: `<div class="elfsight-reviews-mount" aria-label="Customer reviews" role="region"></div>`,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-height: 420px;
    }

    .elfsight-reviews-mount {
      width: 100%;
      min-height: 420px;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElfsightReviewsComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      this.mountWidget();
    });
  }

  private mountWidget(): void {
    const mount = this.host.nativeElement.querySelector(
      '.elfsight-reviews-mount',
    ) as HTMLElement | null;
    if (!mount) {
      return;
    }

    // Fresh node each visit so SPA navigation re-triggers Elfsight.
    mount.replaceChildren();
    const widget = document.createElement('div');
    widget.className = ELFSIGHT_APP_CLASS;
    mount.appendChild(widget);

    this.ensurePlatformScript(() => this.reinitialize());
  }

  private ensurePlatformScript(onReady: () => void): void {
    const existing = document.getElementById(
      ELFSIGHT_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      if (existing.dataset['loaded'] === 'true') {
        onReady();
      } else {
        existing.addEventListener('load', onReady, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = ELFSIGHT_SCRIPT_ID;
    script.src = ELFSIGHT_SCRIPT_SRC;
    script.async = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset['loaded'] = 'true';
        onReady();
      },
      { once: true },
    );
    script.addEventListener(
      'error',
      () => {
        console.error(
          '[elfsight] Failed to load platform.js check network / ad blockers',
        );
      },
      { once: true },
    );
    document.head.appendChild(script);
  }

  private reinitialize(): void {
    const w = window as Window & {
      elfsight?: { initialize?: () => void };
      eapps?: {
        initialize?: () => void;
        Platform?: { initialize?: () => void };
      };
    };
    w.eapps?.Platform?.initialize?.();
    w.eapps?.initialize?.();
    w.elfsight?.initialize?.();
  }
}
