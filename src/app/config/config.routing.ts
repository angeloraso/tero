import { Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  USERS = 'users',
  GARBAGE_HISTORY = 'garbage-history',
  NOTIFICATION_SETTINGS = 'notification-settings'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@config/config.component').then(m => m.ConfigComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'config' }
  },
  {
    path: PATH.USERS,
    loadChildren: () => import('@config/users/users.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.GARBAGE_HISTORY,
    loadChildren: () => import('@config/garbage-history/garbage-history.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.NOTIFICATION_SETTINGS,
    loadChildren: () => import('@config/notification-settings/notification-settings.routing').then(m => m.ROUTES)
  }
];
