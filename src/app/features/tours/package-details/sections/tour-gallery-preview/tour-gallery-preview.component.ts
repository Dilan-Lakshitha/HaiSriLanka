import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { ImageAsset } from '../../../../../core/models';
import { RevealDirective } from '../../../../../core/directives/reveal.directive';

@Component({
  selector: 'app-tour-gallery-preview',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './tour-gallery-preview.component.html',
  styleUrl: './tour-gallery-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourGalleryPreviewComponent {
  readonly images = input.required<ImageAsset[]>();
  readonly openGallery = output<number>();

  readonly activeIndex = signal(0);
  private readonly thumbsTrack = viewChild<ElementRef<HTMLElement>>('thumbsTrack');

  readonly total = computed(() => this.images().length);
  readonly showThumbNav = computed(() => this.total() > 4);
  readonly activeImage = computed(() => {
    const list = this.images();
    if (!list.length) return null;
    const i = Math.min(Math.max(this.activeIndex(), 0), list.length - 1);
    return list[i];
  });

  selectThumb(index: number): void {
    this.activeIndex.set(index);
    this.scrollActiveIntoView(index);
  }

  prevImage(): void {
    const count = this.total();
    if (count < 2) return;
    this.selectThumb((this.activeIndex() - 1 + count) % count);
  }

  nextImage(): void {
    const count = this.total();
    if (count < 2) return;
    this.selectThumb((this.activeIndex() + 1) % count);
  }

  scrollThumbs(direction: -1 | 1): void {
    const el = this.thumbsTrack()?.nativeElement;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.7, 180);
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  openLightbox(index = this.activeIndex()): void {
    this.openGallery.emit(index);
  }

  private scrollActiveIntoView(index: number): void {
    const el = this.thumbsTrack()?.nativeElement;
    if (!el) return;
    const thumb = el.children.item(index) as HTMLElement | null;
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }
}
