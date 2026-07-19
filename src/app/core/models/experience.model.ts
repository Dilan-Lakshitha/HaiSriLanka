import type { ImageAsset, LocaleCode, PageSeo } from './tour.model';

export interface Experience {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  /** Filter chip group (Wildlife, Culture, Adventure, Coast, Village) */
  category: string;
  highlights?: string[];
  images: ImageAsset[];
  relatedTourSlugs: string[];
  relatedDestinationSlugs?: string[];
  seo: PageSeo;
  localizedSlugs?: Partial<Record<LocaleCode, string>>;
  status: 'published' | 'draft';
}
