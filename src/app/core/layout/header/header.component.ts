import { AsyncPipe, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, fromEvent, map } from 'rxjs';
import { LocaleService } from '../../services/locale.service';
import { CompanyService, NavigationService } from '../../services/content.services';
import { MainNavComponent } from '../main-nav/main-nav.component';
import { MobileNavComponent } from '../mobile-nav/mobile-nav.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

/** Routes where the header overlays a full-bleed hero at the top of the page. */
function isHeroRoute(url: string): boolean {
  const path = url.split('?')[0].split('#')[0];
  return (
    /^\/[a-z]{2}\/?$/.test(path) ||
    /^\/[a-z]{2}\/(day-tour|multi-day-tour)\/[^/]+\/?$/.test(path) ||
    /^\/[a-z]{2}\/(day-tours|multi-day-tours|sri-lanka-tours|destinations|things-to-do|blog|contact|reviews)\/?$/.test(path) ||
    /^\/[a-z]{2}\/(destinations|things-to-do|blog)\/[^/]+\/?$/.test(path)
  );
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    AsyncPipe,
    NgOptimizedImage,
    RouterLink,
    TopBarComponent,
    MainNavComponent,
    MobileNavComponent,
    LanguageSwitcherComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly navigation = inject(NavigationService);
  private readonly companyService = inject(CompanyService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  readonly locale = inject(LocaleService);

  readonly scrolled = signal(false);
  readonly overHero = signal(true);

  /** Solid navy after scroll, or on pages without a hero overlay. */
  readonly solid = computed(() => this.scrolled() || !this.overHero());

  /** Reserve flow space so content is not hidden under the fixed header. */
  readonly needsSpacer = computed(() => !this.overHero());

  readonly primaryNav$ = this.navigation.getNavigation().pipe(map((nav) => nav.primary));
  readonly company$ = this.companyService.getCompany();

  constructor() {
    this.overHero.set(isHeroRoute(this.router.url));
    this.syncScrollState();

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.overHero.set(isHeroRoute(e.urlAfterRedirects));
        this.syncScrollState();
      });

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window, 'scroll', { passive: true })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.syncScrollState());
    }
  }

  private syncScrollState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    this.scrolled.set(y > 12);
  }
}
