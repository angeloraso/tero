import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';
import { UsersService } from '@core/services';

export enum PATH {
  EMPTY = '',
  SECURITY = 'security',
  ECOMMERCE = 'ecommerce',
  GARBAGE_HISTORY = 'garbage-history',
  TOPICS = 'topics'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/dashboard.component').then(m => m.DashboardComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'dashboard' }
  },
  {
    path: PATH.SECURITY,
    loadChildren: () => import('@dashboard/security/security.routing').then(m => m.ROUTES),
    canMatch: [
      () => {
        const router = inject(Router);
        const usersService = inject(UsersService);
        return Promise.all([usersService.isNeighbor(), usersService.isSecurity()]).then(([isNeighbor, isSecurity]) => {
          if (!isNeighbor && !isSecurity) {
            router.navigateByUrl('/', { replaceUrl: true });
            console.error('Role error: User has not security or neighbor role');
            return false;
          }

          return true;
        });
      }
    ]
  },
  {
    path: PATH.ECOMMERCE,
    loadChildren: () => import('@dashboard/ecommerce/ecommerce.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.GARBAGE_HISTORY,
    loadChildren: () => import('@dashboard/garbage-history/garbage-history.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.TOPICS,
    loadChildren: () => import('@dashboard/topics/topics.routing').then(m => m.ROUTES),
    canMatch: [
      () => {
        const router = inject(Router);
        const usersService = inject(UsersService);
        return Promise.all([usersService.isNeighbor(), usersService.isConfig()]).then(([isNeighbor, isConfig]) => {
          if (!isNeighbor && !isConfig) {
            router.navigateByUrl('/', { replaceUrl: true });
            console.error('Role error: User has not config or neighbor role');
            return false;
          }

          return true;
        });
      }
    ]
  }
];
