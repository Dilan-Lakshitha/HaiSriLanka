import type { ImageAsset, LocaleCode, PageSeo } from './tour.model';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Plain text; paragraphs separated by blank lines */
  content: string;
  author: string;
  publishDate: string;
  images: ImageAsset[];
  tags: string[];
  relatedTourSlugs?: string[];
  seo: PageSeo;
  localizedSlugs?: Partial<Record<LocaleCode, string>>;
  status: 'published' | 'draft';
}
