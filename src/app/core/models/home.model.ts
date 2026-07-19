import type { ImageAsset, FaqItem, PageSeo } from './tour.model';

export interface HomeCtaLink {
  label: string;
  path: string;
}

export interface HomeSectionIntro {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAllPath?: string;
  viewAllLabel?: string;
  pageKey?: string;
}

export interface HomeHero {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: HomeCtaLink;
  secondaryCta: HomeCtaLink;
  /** Primary / fallback hero image */
  image: ImageAsset;
  /** Optional full-bleed carousel slides (falls back to `image`) */
  images?: ImageAsset[];
}

export interface HomeSearchOption {
  value: string;
  label: string;
}

export interface HomeSearch {
  title: string;
  subtitle: string;
  destinationLabel: string;
  durationLabel: string;
  styleLabel: string;
  submitLabel: string;
  destinations: HomeSearchOption[];
  durations: HomeSearchOption[];
  styles: HomeSearchOption[];
}

export interface WhyChooseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TourCategoryItem {
  id: string;
  title: string;
  description: string;
  path: string;
  image: ImageAsset;
}

export interface MapRegion {
  id: string;
  name: string;
  description: string;
}

export interface HomeMapSection extends HomeSectionIntro {
  image: ImageAsset;
  regions: MapRegion[];
}

export interface TravelStat {
  id: string;
  value: string;
  label: string;
}

export interface HomeCta {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: HomeCtaLink;
  secondaryCta: HomeCtaLink;
  image: ImageAsset;
}

export interface HomeContent {
  seo: PageSeo;
  hero: HomeHero;
  search: HomeSearch;
  whyChoose: HomeSectionIntro & { items: WhyChooseItem[] };
  tourCategories: HomeSectionIntro & { items: TourCategoryItem[] };
  featuredMultiDay: HomeSectionIntro;
  featuredDay: HomeSectionIntro;
  destinations: HomeSectionIntro;
  map: HomeMapSection;
  reviews: HomeSectionIntro;
  stats: { eyebrow: string; title: string; items: TravelStat[] };
  blog: HomeSectionIntro;
  faq: HomeSectionIntro;
  cta: HomeCta;
}
