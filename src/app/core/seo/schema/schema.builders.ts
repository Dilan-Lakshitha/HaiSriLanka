import { APP_CONFIG } from '../../config/app.config';
import type { CompanyInfo, FaqItem, Tour, BlogPost, Review, ImageAsset } from '../../models';

/** Absolute site URL for schema / breadcrumbs (never leave relative paths). */
export function absUrl(pathOrUrl: string): string {
  if (!pathOrUrl) {
    return APP_CONFIG.siteUrl;
  }
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  return `${APP_CONFIG.siteUrl}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function buildOrganizationSchema(company: CompanyInfo): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': `${APP_CONFIG.siteUrl}/#organization`,
    name: company.legalName,
    alternateName: company.brandName,
    url: APP_CONFIG.siteUrl,
    logo: `${APP_CONFIG.siteUrl}${company.logo.src}`,
    email: company.email,
    telephone: company.phone[0],
    foundingDate: String(company.foundingYear),
    sameAs: Object.values(company.social).filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      ...company.address,
    },
  };
}

export function buildLocalBusinessSchema(company: CompanyInfo): Record<string, unknown> {
  return {
    '@type': 'TravelAgency',
    '@id': `${APP_CONFIG.siteUrl}/#localbusiness`,
    name: company.brandName,
    image: `${APP_CONFIG.siteUrl}${company.logo.src}`,
    url: APP_CONFIG.siteUrl,
    telephone: company.phone[0],
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      ...company.address,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: company.geo.lat,
      longitude: company.geo.lng,
    },
    priceRange: '$$',
  };
}

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${APP_CONFIG.siteUrl}/#website`,
    url: APP_CONFIG.siteUrl,
    name: APP_CONFIG.siteName,
    publisher: { '@id': `${APP_CONFIG.siteUrl}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${APP_CONFIG.siteUrl}/en/sri-lanka-tours?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absUrl(item.url),
    })),
  };
}

export function buildTourItemListSchema(
  tours: Tour[],
  lang: string,
  listName: string,
  listPath: string,
): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    name: listName,
    url: `${APP_CONFIG.siteUrl}/${lang}/${listPath}`,
    numberOfItems: tours.length,
    itemListElement: tours.map((tour, index) => {
      const detailPath =
        tour.category === 'day'
          ? `/${lang}/day-tour/${tour.slug}`
          : `/${lang}/multi-day-tour/${tour.slug}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `${APP_CONFIG.siteUrl}${detailPath}`,
        name: tour.title,
      };
    }),
  };
}

export function buildFaqSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildTourProductSchema(
  tour: Tour,
  lang: string,
  reviews: Review[] = [],
): Record<string, unknown> {
  const path =
    tour.category === 'day'
      ? `/${lang}/day-tour/${tour.slug}`
      : `/${lang}/multi-day-tour/${tour.slug}`;
  const url = `${APP_CONFIG.siteUrl}${path}`;
  const productId = `${url}#product`;
  const prices = tour.pricing?.length
    ? tour.pricing.map((p) => p.pricePerPerson)
    : Object.values(tour.price);
  const images = (tour.gallery?.length ? tour.gallery : tour.images).map(
    (img: ImageAsset) => `${APP_CONFIG.siteUrl}${img.src}`,
  );
  const schema: Record<string, unknown> = {
    '@type': 'Product',
    '@id': productId,
    name: tour.title,
    description: tour.shortDescription || tour.overview || tour.description,
    image: images,
    sku: tour.id,
    brand: { '@type': 'Brand', name: APP_CONFIG.siteName },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tour.rating.average,
      reviewCount: tour.rating.count,
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: tour.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      availability: 'https://schema.org/InStock',
      url,
    },
  };
  if (reviews.length) {
    schema['review'] = reviews.slice(0, 5).map((review) =>
      buildReviewSchema(review, {
        '@type': 'Product',
        '@id': productId,
        name: tour.title,
        url,
      }),
    );
  }
  return schema;
}

export function buildTourOfferSchema(tour: Tour, lang: string): Record<string, unknown> {
  const path =
    tour.category === 'day'
      ? `/${lang}/day-tour/${tour.slug}`
      : `/${lang}/multi-day-tour/${tour.slug}`;
  const price =
    tour.pricing?.find((p) => p.travelers === 2)?.pricePerPerson ??
    tour.price?.['2'] ??
    tour.pricing?.[0]?.pricePerPerson ??
    0;
  return {
    '@type': 'Offer',
    '@id': `${APP_CONFIG.siteUrl}${path}#offer`,
    name: tour.title,
    url: `${APP_CONFIG.siteUrl}${path}`,
    priceCurrency: tour.currency,
    price,
    availability: 'https://schema.org/InStock',
    category: tour.travelStyle || tour.category,
  };
}

export function buildArticleSchema(post: BlogPost, lang: string): Record<string, unknown> {
  return {
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.images.map((img: ImageAsset) => `${APP_CONFIG.siteUrl}${img.src}`),
    datePublished: post.publishDate,
    author: { '@type': 'Person', name: post.author },
    mainEntityOfPage: `${APP_CONFIG.siteUrl}/${lang}/blog/${post.slug}`,
  };
}

export type ReviewItemReviewed = {
  '@type': 'Product' | 'LocalBusiness' | 'TravelAgency' | 'Organization';
  '@id'?: string;
  name: string;
  url?: string;
};

/** Review snippet schema — Google requires `itemReviewed` for rich results. */
export function buildReviewSchema(
  review: Review,
  itemReviewed: ReviewItemReviewed,
): Record<string, unknown> {
  return {
    '@type': 'Review',
    author: { '@type': 'Person', name: review.author },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.content,
    datePublished: review.date,
    itemReviewed,
  };
}

export function buildGraph(
  ...nodes: Array<Record<string, unknown> | null | undefined>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  };
}
