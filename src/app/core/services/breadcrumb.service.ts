import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private readonly itemsSignal = signal<BreadcrumbItem[]>([]);
  readonly items = this.itemsSignal.asReadonly();

  set(items: BreadcrumbItem[]): void {
    this.itemsSignal.set(items);
  }

  clear(): void {
    this.itemsSignal.set([]);
  }
}
