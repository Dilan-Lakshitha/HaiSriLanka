import { Routes } from '@angular/router';
import { TourListPageComponent } from './tour-list/tour-list-page.component';
import { TourDetailPageComponent } from './package-details/tour-detail-page.component';

export const TOUR_LIST_DAY_ROUTES: Routes = [
  {
    path: '',
    component: TourListPageComponent,
    data: { category: 'day' },
  },
];

export const TOUR_LIST_MULTI_ROUTES: Routes = [
  {
    path: '',
    component: TourListPageComponent,
    data: { category: 'multi-day' },
  },
];

export const TOUR_DETAIL_ROUTES: Routes = [
  {
    path: ':slug',
    component: TourDetailPageComponent,
  },
];
