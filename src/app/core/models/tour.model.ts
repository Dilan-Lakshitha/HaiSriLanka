import type { SupportedLocale } from '../config/app.config';
import type { Review } from './review.model';

export type LocaleCode = SupportedLocale;

export interface PageSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export interface ImageAsset {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  name: string;
  region?: string;
  geo?: GeoPoint;
}

/** Compact expandable timeline day */
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  locations: string[];
  travelTime?: string;
  meals?: string[];
  accommodation?: string;
  highlights?: string[];
  optionalActivities?: string[];
  images?: ImageAsset[];
  location?: LocationInfo;
}

export interface RatingSummary {
  average: number;
  count: number;
}

export type PersonCountKey = '1' | '2' | '3' | '4' | '5';
export type PersonPricing = Record<PersonCountKey, number>;

/** Primary pricing contract — editable in tour JSON */
export interface TourPricingTier {
  travelers: 1 | 2 | 3 | 4 | 5;
  pricePerPerson: number;
}

export type TourBadge =
  | 'best-seller'
  | 'luxury'
  | 'family'
  | 'adventure'
  | 'wildlife'
  | 'culture'
  | 'featured';

export interface TourRouteStop {
  name: string;
}

export interface TourTranslation {
  title?: string;
  shortDescription?: string;
  description?: string;
  overview?: string;
  seo?: Partial<PageSeo>;
}

export interface TourSchemaExtras {
  tourType?: string;
  suitableFor?: string[];
}

/**
 * Production tour document.
 * Add a tour = drop `assets/json/tours/items/{slug}.json` + images under
 * `assets/images/tours/{slug}/`, then register slug in `manifest.json`.
 */
export interface Tour {
  id: string;
  slug: string;
  category: 'day' | 'multi-day';
  title: string;
  /** Explicit SEO title (also mirrored in seo.metaTitle) */
  seoTitle: string;
  metaDescription: string;
  shortDescription: string;
  overview: string;
  duration: string;
  destinations: string[];
  travelStyle: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: ItineraryDay[];
  faqs: FaqItem[];
  /** Optional embedded reviews; otherwise ReviewService by slug is used */
  reviews?: Review[];
  pricing: TourPricingTier[];
  currency: 'USD' | 'EUR';
  relatedTours: string[];
  badges: TourBadge[];
  tags: string[];
  route: TourRouteStop[];
  /** Open in Google Maps (external) — no iframe embeds */
  mapsUrl: string;
  heroImage: ImageAsset;
  gallery: ImageAsset[];
  rating: RatingSummary;
  seo: PageSeo;
  schema?: TourSchemaExtras;
  translations?: Partial<Record<LocaleCode, TourTranslation>>;
  localizedSlugs?: Partial<Record<LocaleCode, string>>;
  status: 'published' | 'draft';

  /** Compatibility mirrors for older consumers */
  description: string;
  location: LocationInfo;
  price: PersonPricing;
  images: ImageAsset[];
  includes: string[];
  excludes: string[];
  faq: FaqItem[];
  relatedTourSlugs?: string[];
  featured?: boolean;
  bestSeller?: boolean;
}

export interface TourManifestEntry {
  slug: string;
  category: 'day' | 'multi-day';
  status: 'published' | 'draft';
}

export interface TourManifest {
  tours: TourManifestEntry[];
}

export interface TourListHero {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: ImageAsset;
}

export interface TourListPageContent {
  hero: TourListHero;
  seo: PageSeo;
}

export type TourListsContent = Record<'hub' | 'day' | 'multi-day', TourListPageContent>;

export const TOUR_BADGE_LABELS: Record<TourBadge, string> = {
  'best-seller': 'Best Seller',
  luxury: 'Luxury',
  family: 'Family',
  adventure: 'Adventure',
  wildlife: 'Wildlife',
  culture: 'Culture',
  featured: 'Featured',
};

/** Build PersonPricing map from pricing[] for PricingService */
export function pricingToMap(pricing: TourPricingTier[]): PersonPricing {
  const map = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as PersonPricing;
  for (const tier of pricing) {
    map[String(tier.travelers) as PersonCountKey] = tier.pricePerPerson;
  }
  return map;
}

export function tourPriceMap(tour: Tour): PersonPricing {
  if (tour.pricing?.length) {
    return pricingToMap(tour.pricing);
  }
  return tour.price;
}

export function tourHero(tour: Tour): ImageAsset {
  return (
    tour.heroImage ??
    tour.images?.[0] ?? {
      src: '/assets/images/placeholders/tour-galle.svg',
      alt: tour.title,
    }
  );
}

export function tourGallery(tour: Tour): ImageAsset[] {
  return tour.gallery?.length ? tour.gallery : tour.images ?? [];
}

export function tourFaqs(tour: Tour): FaqItem[] {
  return tour.faqs?.length ? tour.faqs : tour.faq ?? [];
}

export function tourIncluded(tour: Tour): string[] {
  return tour.included?.length ? tour.included : tour.includes ?? [];
}

export function tourExcluded(tour: Tour): string[] {
  return tour.excluded?.length ? tour.excluded : tour.excludes ?? [];
}

export function tourRelatedSlugs(tour: Tour): string[] {
  return tour.relatedTours?.length ? tour.relatedTours : tour.relatedTourSlugs ?? [];
}

export function tourHasBadge(tour: Tour, badge: TourBadge): boolean {
  if (tour.badges?.includes(badge)) {
    return true;
  }
  if (badge === 'featured') {
    return !!tour.featured;
  }
  if (badge === 'best-seller') {
    return !!tour.bestSeller;
  }
  return false;
}
