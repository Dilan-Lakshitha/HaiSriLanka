import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'hsl.wishlist';

/** Future-ready wishlist (localStorage); wire to account later without API changes. */
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly slugs = signal<string[]>(this.read());

  readonly items = this.slugs.asReadonly();
  readonly count = computed(() => this.slugs().length);

  has(slug: string): boolean {
    return this.slugs().includes(slug);
  }

  toggle(slug: string): void {
    this.slugs.update((list) =>
      list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug],
    );
    this.persist();
  }

  private read(): string[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.slugs()));
  }
}
