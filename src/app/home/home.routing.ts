import { Routes } from '@angular/router';
import { authGuard } from '@core/guards';

export enum PATH {
  EMPTY = '',
  NEIGHBORS = 'neighbors',
  DASHBOARD = 'dashboard',
  NEIGHBORHOOD = 'neighborhood',
  CONTACTS = 'contacts',
  CONFIG = 'config',
  ANY = '**'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@home/home.component').then(m => m.HomeComponent),
    children: [
      {
        path: PATH.EMPTY,
        redirectTo: PATH.DASHBOARD,
        pathMatch: 'full'
      },
      {
        path: PATH.NEIGHBORS,
        loadChildren: () => import('@neighbors/neighbors.routing').then(m => m.ROUTES),
        canActivate: [authGuard]
      },
      {
        path: PATH.NEIGHBORHOOD,
        loadChildren: () => import('@neighborhood/neighborhood.routing').then(m => m.ROUTES),
        canActivate: [authGuard]
      },
      {
        path: PATH.DASHBOARD,
        loadChildren: () => import('@dashboard/dashboard.routing').then(m => m.ROUTES),
        canActivate: [authGuard]
      },
      {
        path: PATH.CONTACTS,
        loadChildren: () => import('@contacts/contacts.routing').then(m => m.ROUTES),
        canActivate: [authGuard]
      },
      {
        path: PATH.CONFIG,
        loadChildren: () => import('@config/config.routing').then(m => m.ROUTES),
        canActivate: [authGuard]
      },
      {
        path: PATH.ANY,
        redirectTo: PATH.DASHBOARD
      }
    ]
  }
];
