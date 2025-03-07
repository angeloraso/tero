import { Routes } from '@angular/router';
import { configGuard } from '@core/guards';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@neighbors/neighbors.component').then(m => m.NeighborsComponent),
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    loadComponent: () => import('@neighbors/add-neighbor/add-neighbor.component').then(m => m.AddNeighborComponent),
    canActivate: [configGuard]
  },
  {
    path: ':neighborId',
    loadComponent: () => import('@neighbors/edit-neighbor/edit-neighbor.component').then(m => m.EditNeighborComponent),
    canActivate: [configGuard]
  }
];
