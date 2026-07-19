import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import type { GeoPoint } from '../../../core/models/tour.model';
import { MapsService } from '../../../core/services/maps.service';

@Component({
  selector: 'app-map-embed',
  standalone: true,
  templateUrl: './map-embed.component.html',
  styleUrl: './map-embed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapEmbedComponent {
  private readonly maps = inject(MapsService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly geo = input.required<GeoPoint>();
  readonly zoom = input(12);
  readonly title = input('Map');
  readonly height = input('280px');

  readonly embedSrc = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      this.maps.embedUrl(this.geo(), this.zoom()),
    ),
  );
  readonly openSrc = computed(() => this.maps.openUrl(this.geo()));
}
