import { Routes } from '@angular/router';
import { configGuard } from '@core/guards';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@neighbors/neighbors.component').then(m => m.NeighborsComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'neighbors' }
  },
  {
    path: PATH.ADD,
    loadComponent: () => import('@neighbors/add-neighbor/add-neighbor.component').then(m => m.AddNeighborComponent),
    canActivate: [configGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'add-neighbor' }
  },
  {
    path: ':neighborId',
    loadComponent: () => import('@neighbors/edit-neighbor/edit-neighbor.component').then(m => m.EditNeighborComponent),
    canActivate: [configGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'edit-neighbor' }
  }
];
