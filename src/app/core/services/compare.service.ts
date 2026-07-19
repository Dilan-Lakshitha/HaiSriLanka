import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'hsl.compare';
const MAX = 3;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly slugs = signal<string[]>(this.read());

  readonly items = this.slugs.asReadonly();
  readonly count = computed(() => this.slugs().length);

  has(slug: string): boolean {
    return this.slugs().includes(slug);
  }

  toggle(slug: string): void {
    this.slugs.update((list) => {
      if (list.includes(slug)) {
        return list.filter((s) => s !== slug);
      }
      if (list.length >= MAX) {
        return [...list.slice(1), slug];
      }
      return [...list, slug];
    });
    this.persist();
  }

  clear(): void {
    this.slugs.set([]);
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
