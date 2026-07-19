import { Routes } from '@angular/router';

export const EXPERIENCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./experience-list/experience-list-page.component').then(
        (m) => m.ExperienceListPageComponent,
      ),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./experience-detail/experience-detail-page.component').then(
        (m) => m.ExperienceDetailPageComponent,
      ),
  },
];
