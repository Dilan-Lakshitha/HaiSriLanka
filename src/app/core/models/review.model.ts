import type { ReviewSource } from '../enums/tour-category.enum';

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  source: ReviewSource | 'google' | 'tripadvisor' | 'site' | 'internal';
  tourSlug?: string;
  avatarSrc?: string;
  locale?: string;
}
