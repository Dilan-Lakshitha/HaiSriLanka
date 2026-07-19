import type { ImageAsset, LocaleCode, PageSeo } from './tour.model';

export interface Destination {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  region: string;
  highlights?: string[];
  images: ImageAsset[];
  relatedTourSlugs: string[];
  seo: PageSeo;
  localizedSlugs?: Partial<Record<LocaleCode, string>>;
  status: 'published' | 'draft';
}
