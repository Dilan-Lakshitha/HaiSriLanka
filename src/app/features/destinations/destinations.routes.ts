import { Routes } from '@angular/router';

export const DESTINATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./destination-list/destination-list-page.component').then(
        (m) => m.DestinationListPageComponent,
      ),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./destination-detail/destination-detail-page.component').then(
        (m) => m.DestinationDetailPageComponent,
      ),
  },
];
