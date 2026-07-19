import { Routes } from '@angular/router';

export const REVIEW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./reviews-page/reviews-page.component').then(
        (m) => m.ReviewsPageComponent,
      ),
  },
];
