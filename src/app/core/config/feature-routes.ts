import { Routes } from '@angular/router';

function foundation(
  path: string,
  pageTitleKey: string,
  seoKey: string,
  routePath = path,
): Routes[number] {
  return {
    path,
    loadComponent: () =>
      import('../../shared/components/foundation-page/foundation-page.component').then(
        (m) => m.FoundationPageComponent,
      ),
    data: { pageTitleKey, seoKey, path: routePath },
  };
}

export const FEATURE_CHILD_ROUTES: Routes = [
  // Lazy home: smaller initial JS (TBT). LCP image stays in index.html.
  {
    path: '',
    loadChildren: () => import('../../features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
  foundation('about', 'nav.about', 'about'),
  {
    path: 'sri-lanka-tours',
    loadComponent: () =>
      import('../../features/tours/tour-hub/tour-hub-page.component').then(
        (m) => m.TourHubPageComponent,
      ),
  },
  {
    path: 'day-tours',
    loadChildren: () =>
      import('../../features/tours/tours.routes').then((m) => m.TOUR_LIST_DAY_ROUTES),
  },
  {
    path: 'day-tour',
    loadChildren: () =>
      import('../../features/tours/tours.routes').then((m) => m.TOUR_DETAIL_ROUTES),
  },
  {
    path: 'multi-day-tours',
    loadChildren: () =>
      import('../../features/tours/tours.routes').then((m) => m.TOUR_LIST_MULTI_ROUTES),
  },
  {
    path: 'multi-day-tour',
    loadChildren: () =>
      import('../../features/tours/tours.routes').then((m) => m.TOUR_DETAIL_ROUTES),
  },
  {
    path: 'destinations',
    loadChildren: () =>
      import('../../features/destinations/destinations.routes').then(
        (m) => m.DESTINATION_ROUTES,
      ),
  },
  foundation('travel-guide', 'nav.travelGuide', 'travelGuide'),
  {
    path: 'things-to-do',
    loadChildren: () =>
      import('../../features/experiences/experiences.routes').then(
        (m) => m.EXPERIENCE_ROUTES,
      ),
  },
  {
    path: 'reviews',
    loadChildren: () =>
      import('../../features/reviews/reviews.routes').then((m) => m.REVIEW_ROUTES),
  },
  foundation('faq', 'nav.faq', 'faq'),
  {
    path: 'contact',
    loadChildren: () =>
      import('../../features/contact/contact.routes').then((m) => m.CONTACT_ROUTES),
  },
  {
    path: 'blog',
    loadChildren: () =>
      import('../../features/blog/blog.routes').then((m) => m.BLOG_ROUTES),
  },
  {
    path: 'booking/:tourSlug/confirmation/:ref',
    loadComponent: () =>
      import('../../features/booking/booking-confirmation-page/booking-confirmation-page.component').then(
        (m) => m.BookingConfirmationPageComponent,
      ),
  },
  {
    path: 'booking/:tourSlug',
    redirectTo: 'sri-lanka-tours',
    pathMatch: 'full',
  },
  foundation('privacy', 'nav.privacy', 'privacy'),
  foundation('terms', 'nav.terms', 'terms'),
  {
    path: '**',
    loadComponent: () =>
      import('../../features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
