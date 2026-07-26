import type { ImageAsset, PageSeo } from './tour.model';

export interface CompanyAddress {
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

export interface CompanyAward {
  id: string;
  title: string;
  year: string;
}

export interface TripadvisorBadge {
  rating: number;
  reviewCount: number;
  label: string;
  url: string;
}

export interface NewsletterCopy {
  title: string;
  subtitle: string;
  placeholder: string;
  buttonLabel: string;
  disclaimer: string;
}

/** Logo variants for transparent / solid / footer surfaces */
export interface BrandLogos {
  /** Default / light backgrounds */
  primary: ImageAsset;
  /** Dark / navy / transparent hero header */
  onDark: ImageAsset;
  /** Light surfaces */
  onLight: ImageAsset;
  /** Solid sticky navy header */
  sticky: ImageAsset;
  favicon?: ImageAsset;
}

export interface CompanyInfo {
  legalName: string;
  brandName: string;
  email: string;
  phone: string[];
  whatsapp?: string;
  address: CompanyAddress;
  geo: { lat: number; lng: number };
  social: {
    facebook?: string;
    instagram?: string;
    tripadvisor?: string;
    youtube?: string;
  };
  tripadvisor?: TripadvisorBadge;
  awards?: CompanyAward[];
  newsletter?: NewsletterCopy;
  logo: ImageAsset;
  logos: BrandLogos;
  foundingYear: number;
  description: string;
  seo: PageSeo;
}

export interface LocaleDefinition {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  enabled: boolean;
  hreflang: string;
}

export interface NavItem {
  key: string;
  path: string;
  label?: string;
  description?: string;
  mega?: boolean;
  children?: NavItem[];
}

export interface NavigationConfig {
  primary: NavItem[];
  footer: {
    explore: NavItem[];
    company: NavItem[];
    legal: NavItem[];
  };
}
