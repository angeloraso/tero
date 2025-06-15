import { Routes } from '@angular/router';
import { neighborGuard } from '@core/guards';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/garbage-history/garbage-history.component').then(m => m.GarbageHistoryComponent),
    pathMatch: 'full',
    canActivate: [neighborGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'garbage-history' }
  }
];
