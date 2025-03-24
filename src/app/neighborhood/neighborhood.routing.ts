import { Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@neighborhood/neighborhood.component').then(m => m.NeighborhoodComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'neighborhood' }
  }
];
