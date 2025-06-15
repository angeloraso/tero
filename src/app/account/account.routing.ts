import { Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  USERS = 'users',
  NOTIFICATION_SETTINGS = 'notification-settings'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@account/account.component').then(m => m.AccountComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'account' }
  },
  {
    path: PATH.USERS,
    loadChildren: () => import('@account/users/users.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.NOTIFICATION_SETTINGS,
    loadChildren: () => import('@account/notification-settings/notification-settings.routing').then(m => m.ROUTES)
  }
];
