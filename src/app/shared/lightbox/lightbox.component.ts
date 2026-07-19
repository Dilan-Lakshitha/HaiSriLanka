import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import type { ImageAsset } from '../../core/models';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LightboxComponent {
  private readonly document = inject(DOCUMENT);

  readonly open = input(false);
  readonly images = input.required<ImageAsset[]>();
  readonly startIndex = input(0);
  readonly closed = output<void>();

  readonly index = signal(0);

  /** Fixed fullscreen host only while open — avoids `display: contents` breaking fixed positioning */
  @HostBinding('class.is-open')
  get hostOpen(): boolean {
    return this.open();
  }

  constructor() {
    effect(() => {
      if (this.open()) {
        const start = this.startIndex();
        const len = this.images().length;
        this.index.set(len ? Math.min(Math.max(start, 0), len - 1) : 0);
        this.document.body.style.overflow = 'hidden';
      } else {
        this.document.body.style.overflow = '';
      }
    });
  }

  close(): void {
    this.document.body.style.overflow = '';
    this.closed.emit();
  }

  next(): void {
    const len = this.images().length;
    if (!len) return;
    this.index.update((i) => (i + 1) % len);
  }

  prev(): void {
    const len = this.images().length;
    if (!len) return;
    this.index.update((i) => (i - 1 + len) % len);
  }

  goTo(i: number): void {
    const len = this.images().length;
    if (!len) return;
    this.index.set(Math.min(Math.max(i, 0), len - 1));
  }

  current(): ImageAsset | null {
    return this.images()[this.index()] ?? null;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (!this.open()) return;
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    }
  }
}
