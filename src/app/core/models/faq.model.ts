import type { FaqItem, PageSeo } from './tour.model';

export interface FaqPage {
  pageKey: string;
  items: FaqItem[];
  seo?: PageSeo;
}

export interface FaqDataset {
  global: FaqItem[];
  pages: FaqPage[];
}
