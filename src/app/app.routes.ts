import { Routes } from '@angular/router';
import { localeGuard, rootRedirectGuard } from './core/guards/locale.guard';

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
    // Shell + chrome lazy: keeps Angular framework parse smaller before first interaction.
    loadChildren: () =>
      import('./core/layout/lang.routes').then((m) => m.LANG_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'en',
  },
];
