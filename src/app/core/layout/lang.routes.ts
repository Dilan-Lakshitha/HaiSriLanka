import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { FEATURE_CHILD_ROUTES } from '../config/feature-routes';

/** Locale-scoped chrome + feature routes (lazy from app.routes). */
export const LANG_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: FEATURE_CHILD_ROUTES,
  },
];
