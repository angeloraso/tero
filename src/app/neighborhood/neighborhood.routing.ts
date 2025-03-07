import { Routes } from '@angular/router';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@neighborhood/neighborhood.component').then(m => m.NeighborhoodComponent),
    pathMatch: 'full'
  }
];
