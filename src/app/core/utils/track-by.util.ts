export function trackById<T extends { id: string }>(_index: number, item: T): string {
  return item.id;
}

export function trackBySlug<T extends { slug: string }>(_index: number, item: T): string {
  return item.slug;
}

export function trackByIndex(index: number): number {
  return index;
}
