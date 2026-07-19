import { Injectable } from '@angular/core';
import type { GeoPoint } from '../models/tour.model';

@Injectable({ providedIn: 'root' })
export class MapsService {
  embedUrl(geo: GeoPoint, zoom = 12): string {
    const q = `${geo.lat},${geo.lng}`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&output=embed`;
  }

  openUrl(geo: GeoPoint): string {
    return `https://www.google.com/maps?q=${geo.lat},${geo.lng}`;
  }

  pathEmbedUrl(points: GeoPoint[], zoom = 8): string {
    if (!points.length) {
      return '';
    }
    const center = points[Math.floor(points.length / 2)];
    return this.embedUrl(center, zoom);
  }
}
