import { Routes } from '@angular/router';
import { configGuard } from '@core/guards';

export enum PATH {
  EMPTY = '',
  USERS = 'users',
  GARBAGE_HISTORY = 'garbage-history'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@config/config.component').then(m => m.ConfigComponent),
    pathMatch: 'full'
  },
  {
    path: PATH.USERS,
    loadChildren: () => import('@config/users/users.routing').then(m => m.ROUTES),
    canActivate: [configGuard]
  },
  {
    path: PATH.GARBAGE_HISTORY,
    loadChildren: () =>
      import('@config/garbage-history/garbage-history.routing').then(m => m.ROUTES)
  }
];
