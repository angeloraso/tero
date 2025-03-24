import { Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@config/garbage-history/garbage-history.component').then(m => m.GarbageHistoryComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'garbage-history' }
  }
];
