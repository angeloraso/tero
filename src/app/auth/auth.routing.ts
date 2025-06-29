import { Routes } from '@angular/router';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@auth/auth.component').then(m => m.AuthComponent),
    pathMatch: 'full'
  }
];
