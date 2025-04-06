import { Routes } from '@angular/router';
import { autoSignInGuard } from '@core/guards';

export enum PATH {
  EMPTY = '',
  HOME = 'home',
  AUTH = 'auth',
  ANY = '**'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    redirectTo: PATH.AUTH,
    pathMatch: 'full'
  },
  {
    path: PATH.AUTH,
    loadChildren: () => import('@auth/auth.routing').then(m => m.ROUTES),
    canActivate: [autoSignInGuard]
  },
  {
    path: PATH.HOME,
    loadChildren: () => import('@home/home.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.ANY,
    redirectTo: PATH.AUTH
  }
];
