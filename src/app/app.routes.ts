import { Routes } from '@angular/router';
import { localeGuard, rootRedirectGuard } from './core/guards/locale.guard';
import { ShellComponent } from './core/layout/shell/shell.component';
import { FEATURE_CHILD_ROUTES } from './core/config/feature-routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  {
    path: ':lang',
    canActivate: [localeGuard],
    component: ShellComponent,
    children: FEATURE_CHILD_ROUTES,
  },
  {
    path: '**',
    redirectTo: 'en',
  },
];
