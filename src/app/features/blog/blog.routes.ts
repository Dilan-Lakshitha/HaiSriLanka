import { Routes } from '@angular/router';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./blog-list/blog-list-page.component').then((m) => m.BlogListPageComponent),
  },
  {
    path: ':slug',
    loadComponent: () =>
      import('./blog-detail/blog-detail-page.component').then((m) => m.BlogDetailPageComponent),
  },
];
